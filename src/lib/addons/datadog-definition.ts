import {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_STRATEGY_ADD,
    FEATURE_METADATA_UPDATED,
    FEATURE_PROJECT_CHANGE,
    FEATURE_VARIANTS_UPDATED,
    FEATURE_POTENTIALLY_STALE_ON,
} from '../types/events';
import { IAddonDefinition } from '../types/model';

const dataDogDefinition: IAddonDefinition = {
    name: 'datadog',
    displayName: 'Datadog',
    description: 'Allows Unleash to post updates to Datadog.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/datadog',
    howTo: 'The Datadog integration allows Unleash to post Updates to Datadog when a feature toggle is updated.',
    parameters: [
        {
            name: 'url',
            displayName: 'Datadog Events URL',
            description:
                "Default URL: https://api.datadoghq.com/api/v1/events. Needs to be changed if your're not using the US1 site.",
            type: 'url',
            required: false,
            sensitive: false,
        },
        {
            name: 'apiKey',
            displayName: 'Datadog API key',
            placeholder: 'j96c23b0f12a6b3434a8d710110bd862',
            description: '(Required) API key to connect to Datadog',
            type: 'text',
            required: true,
            sensitive: true,
        },
        {
            name: 'sourceTypeName',
            displayName: 'Datadog Source Type Name',
            description:
                '(Optional) source_type_name parameter to be included in Datadog events.',
            type: 'text',
            required: false,
            sensitive: false,
        },
        {
            name: 'customHeaders',
            displayName: 'Extra HTTP Headers',
            placeholder:
                '{\n"ISTIO_USER_KEY": "hunter2",\n"SOME_OTHER_CUSTOM_HTTP_HEADER": "SOMEVALUE"\n}',
            description:
                '(Optional) Used to add extra HTTP Headers to the request the plugin fires off. This must be a valid json object of key-value pairs where both the key and the value are strings',
            required: false,
            sensitive: true,
            type: 'textfield',
        },
    ],
    events: [
        FEATURE_CREATED,
        FEATURE_UPDATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
        FEATURE_STALE_ON,
        FEATURE_STALE_OFF,
        FEATURE_ENVIRONMENT_ENABLED,
        FEATURE_ENVIRONMENT_DISABLED,
        FEATURE_STRATEGY_REMOVE,
        FEATURE_STRATEGY_UPDATE,
        FEATURE_STRATEGY_ADD,
        FEATURE_METADATA_UPDATED,
        FEATURE_PROJECT_CHANGE,
        FEATURE_VARIANTS_UPDATED,
        FEATURE_POTENTIALLY_STALE_ON,
    ],
    tagTypes: [
        {
            name: 'datadog',
            description:
                'All Datadog tags added to a specific feature are sent to datadog event stream.',
            icon: 'D',
        },
    ],
};

export default dataDogDefinition;
