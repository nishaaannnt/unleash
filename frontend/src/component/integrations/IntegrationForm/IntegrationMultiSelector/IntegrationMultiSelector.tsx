import React, { ChangeEvent, Fragment, VFC } from 'react';
import { IAutocompleteBoxOption } from '../../../common/AutocompleteBox/AutocompleteBox';
import {
    AutocompleteRenderGroupParams,
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';
import { styled } from '@mui/system';
import {
    capitalize,
    Checkbox,
    Paper,
    TextField,
    Autocomplete,
    Typography,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { SelectAllButton } from '../../../admin/apiToken/ApiTokenForm/ProjectSelector/SelectProjectInput/SelectAllButton/SelectAllButton';
import {
    StyledHelpText,
    StyledSelectAllFormControlLabel,
    StyledTitle,
} from '../IntegrationForm.styles';

export interface IIntegrationMultiSelectorProps {
    options: IAutocompleteBoxOption[];
    selectedItems: string[];
    onChange: (value: string[]) => void;
    error?: string;
    onFocus?: () => void;
    entityName: string;
    selectAllEnabled: boolean;
    description?: string;
    required?: boolean;
}

const ALL_OPTIONS = '*';

const StyledCheckbox = styled(Checkbox)(() => ({
    marginRight: '0.2em',
}));

const CustomPaper = ({ ...props }) => <Paper elevation={8} {...props} />;

export const IntegrationMultiSelector: VFC<IIntegrationMultiSelectorProps> = ({
    options,
    selectedItems,
    onChange,
    error,
    onFocus,
    entityName,
    selectAllEnabled = true,
    description,
    required,
}) => {
    const renderInput = (params: AutocompleteRenderInputParams) => (
        <TextField
            {...params}
            error={Boolean(error)}
            helperText={error}
            variant="outlined"
            label={`${capitalize(entityName)}s`}
            placeholder={`Select ${entityName}s to filter by`}
            onFocus={onFocus}
            data-testid={`select-${entityName}-input`}
        />
    );

    const isAllSelected =
        selectedItems.length > 0 &&
        selectedItems.length === options.length &&
        selectedItems[0] !== ALL_OPTIONS;

    const isWildcardSelected = selectedItems.includes(ALL_OPTIONS);

    const onAllItemsChange = (
        e: ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => {
        if (checked) {
            onChange([ALL_OPTIONS]);
        } else {
            onChange(selectedItems.includes(ALL_OPTIONS) ? [] : selectedItems);
        }
    };

    const onSelectAllClick = () => {
        const newItems = isAllSelected ? [] : options.map(({ value }) => value);
        onChange(newItems);
    };
    const renderOption = (
        props: object,
        option: IAutocompleteBoxOption,
        { selected }: AutocompleteRenderOptionState
    ) => {
        return (
            <li {...props}>
                <StyledCheckbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    checked={selected}
                />
                {option.label}
            </li>
        );
    };
    const renderGroup = ({ key, children }: AutocompleteRenderGroupParams) => (
        <Fragment key={key}>
            <ConditionallyRender
                condition={options.length > 2 && selectAllEnabled}
                show={
                    <SelectAllButton
                        isAllSelected={isAllSelected}
                        onClick={onSelectAllClick}
                    />
                }
            />
            {children}
        </Fragment>
    );
    const SelectAllFormControl = () => (
        <StyledSelectAllFormControlLabel
            data-testid={`select-all-${entityName}s`}
            control={
                <Checkbox
                    checked={isWildcardSelected}
                    onChange={onAllItemsChange}
                />
            }
            label={`ALL current and future ${entityName}s`}
        />
    );

    const DefaultHelpText = () => (
        <StyledHelpText>
            Selecting {entityName}(s) will filter events, so that your
            integration only receives events related to those specific{' '}
            {entityName}s.
        </StyledHelpText>
    );

    return (
        <React.Fragment>
            <StyledTitle>
                {capitalize(`${entityName}s`)}
                {required ? (
                    <Typography component="span" color="error">
                        *
                    </Typography>
                ) : null}
            </StyledTitle>
            <ConditionallyRender
                condition={selectAllEnabled}
                show={<DefaultHelpText />}
            />
            <ConditionallyRender
                condition={description !== undefined}
                show={<StyledHelpText>{description}</StyledHelpText>}
            />
            <ConditionallyRender
                condition={selectAllEnabled}
                show={<SelectAllFormControl />}
            />
            <Autocomplete
                size="small"
                disabled={isWildcardSelected}
                multiple
                limitTags={2}
                options={options}
                disableCloseOnSelect
                getOptionLabel={({ label }) => label}
                fullWidth
                groupBy={() => 'Select/Deselect all'}
                renderGroup={renderGroup}
                PaperComponent={CustomPaper}
                renderOption={renderOption}
                renderInput={renderInput}
                value={
                    isWildcardSelected
                        ? options
                        : options.filter(option =>
                              selectedItems.includes(option.value)
                          )
                }
                onChange={(_, input) => {
                    const state = input.map(({ value }) => value);
                    onChange(state);
                }}
            />
        </React.Fragment>
    );
};
