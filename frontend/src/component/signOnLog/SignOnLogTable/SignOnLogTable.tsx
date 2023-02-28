import { useEffect, useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { SortingRule, useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { useSearch } from 'hooks/useSearch';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { useSignOnLog } from 'hooks/api/getters/useSignOnLog/useSignOnLog';
import { SignOnLogSuccessfulCell } from './SignOnLogSuccessfulCell/SignOnLogSuccessfulCell';
import { ISignOnEvent } from 'interfaces/signOnEvent';
import { SignOnLogActionsCell } from './SignOnLogActionsCell/SignOnLogActionsCell';
import { SignOnLogDeleteDialog } from './SignOnLogDeleteDialog/SignOnLogDeleteDialog';
import { useSignOnLogApi } from 'hooks/api/actions/useSignOnLogApi/useSignOnLogApi';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useSearchParams } from 'react-router-dom';
import { createLocalStorage } from 'utils/createLocalStorage';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

const defaultSort: SortingRule<string> = { id: 'created_at' };

const { value: storedParams, setValue: setStoredParams } = createLocalStorage(
    'SignOnLogTable:v1',
    defaultSort
);

const AUTH_TYPE_LABEL: { [key: string]: string } = {
    simple: 'Password',
    oidc: 'OIDC',
    saml: 'SAML',
    google: 'Google',
};

export const SignOnLogTable = () => {
    const { setToastData, setToastApiError } = useToast();

    const { events, loading, refetch } = useSignOnLog();
    const { removeEvent } = useSignOnLogApi();

    const [searchParams, setSearchParams] = useSearchParams();
    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        hiddenColumns: ['failure_reason'],
        globalFilter: searchParams.get('search') || '',
    }));

    const [searchValue, setSearchValue] = useState(initialState.globalFilter);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ISignOnEvent>();

    const onDeleteConfirm = async (event: ISignOnEvent) => {
        try {
            await removeEvent(event.id);
            setToastData({
                title: `Event has been deleted`,
                type: 'success',
            });
            refetch();
            setDeleteOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(
        () => [
            {
                Header: 'Created',
                accessor: 'created_at',
                Cell: ({ value }: { value: Date }) => (
                    <TimeAgoCell value={value} dateFormat={formatDateYMDHMS} />
                ),
                sortType: 'date',
                maxWidth: 150,
            },
            {
                Header: 'Username',
                accessor: 'username',
                minWidth: 100,
                Cell: HighlightCell,
                searchable: true,
            },
            {
                Header: 'Authentication',
                accessor: (event: ISignOnEvent) =>
                    AUTH_TYPE_LABEL[event.auth_type] || event.auth_type,
                width: 150,
                maxWidth: 150,
                Cell: HighlightCell,
                searchable: true,
                filterName: 'auth',
            },
            {
                Header: 'IP address',
                accessor: 'ip',
                Cell: HighlightCell,
                searchable: true,
            },
            {
                Header: 'Success',
                accessor: 'successful',
                align: 'center',
                Cell: SignOnLogSuccessfulCell,
                filterName: 'success',
                filterParsing: (value: boolean) => value.toString(),
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original: event } }: any) => (
                    <SignOnLogActionsCell
                        onDelete={() => {
                            setSelectedEvent(event);
                            setDeleteOpen(true);
                        }}
                    />
                ),
                width: 150,
                disableSortBy: true,
            },
            // Always hidden -- for search
            {
                accessor: 'failure_reason',
                Header: 'Failure Reason',
                searchable: true,
            },
        ],
        []
    );

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        events
    );

    const {
        headerGroups,
        rows,
        prepareRow,
        state: { sortBy },
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any,
            data,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            defaultColumn: {
                Cell: TextCell,
            },
        },
        useSortBy,
        useFlexLayout
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isExtraSmallScreen,
                columns: ['role', 'seenAt'],
            },
            {
                condition: isSmallScreen,
                columns: ['imageUrl', 'tokens', 'createdAt'],
            },
        ],
        setHiddenColumns,
        columns
    );

    useEffect(() => {
        const tableState: PageQueryType = {};
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({
            id: sortBy[0].id,
            desc: sortBy[0].desc || false,
        });
    }, [sortBy, searchValue, setSearchParams]);

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Sign-on log (${rows.length})`}
                    actions={
                        <ConditionallyRender
                            condition={!isSmallScreen}
                            show={
                                <Search
                                    initialValue={searchValue}
                                    onChange={setSearchValue}
                                    hasFilters
                                    getSearchContext={getSearchContext}
                                />
                            }
                        />
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                                hasFilters
                                getSearchContext={getSearchContext}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No sign-on events found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No sign-on events available.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <SignOnLogDeleteDialog
                event={selectedEvent}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={onDeleteConfirm}
            />
        </PageContent>
    );
};
