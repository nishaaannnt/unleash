import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types';
import Controller from '../controller';
import { extractUsername } from '../../util/extract-user';
import { DELETE_FEATURE, NONE, UPDATE_FEATURE } from '../../types/permissions';
import FeatureToggleService from '../../services/feature-toggle-service';
import { IAuthRequest } from '../unleash-types';
import {
    featuresSchema,
    FeaturesSchema,
} from '../../openapi/spec/features-schema';
import { serializeDates } from '../../types/serialize-dates';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';

export default class ArchiveController extends Controller {
    private featureService: FeatureToggleService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
            openApiService,
        }: Pick<IUnleashServices, 'featureToggleServiceV2' | 'openApiService'>,
    ) {
        super(config);
        this.featureService = featureToggleServiceV2;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '/features',
            handler: this.getArchivedFeatures,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    summary: 'Get archived features',
                    description:
                        'Retrieve a list of all [archived feature toggles](https://docs.getunleash.io/reference/archived-toggles).',
                    operationId: 'getArchivedFeatures',
                    responses: {
                        200: createResponseSchema('featuresSchema'),
                        ...getStandardResponses(401, 403),
                    },

                    deprecated: true,
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/features/:projectId',
            handler: this.getArchivedFeaturesByProjectId,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    operationId: 'getArchivedFeaturesByProjectId',
                    summary: 'Get archived features in project',
                    description:
                        'Retrieves a list of archived features that belong to the provided project.',
                    responses: {
                        200: createResponseSchema('featuresSchema'),
                        ...getStandardResponses(401, 403),
                    },

                    deprecated: true,
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:featureName',
            acceptAnyContentType: true,
            handler: this.deleteFeature,
            permission: DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    description:
                        'This endpoint archives the specified feature.',
                    summary: 'Archives a feature',
                    operationId: 'deleteFeature',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/revive/:featureName',
            acceptAnyContentType: true,
            handler: this.reviveFeature,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    description:
                        'This endpoint revives the specified feature from archive.',
                    summary: 'Revives a feature',
                    operationId: 'reviveFeature',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });
    }

    async getArchivedFeatures(
        req: Request,
        res: Response<FeaturesSchema>,
    ): Promise<void> {
        const features = await this.featureService.getMetadataForAllFeatures(
            true,
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            featuresSchema.$id,
            { version: 2, features: serializeDates(features) },
        );
    }

    async getArchivedFeaturesByProjectId(
        req: Request<{ projectId: string }, any, any, any>,
        res: Response<FeaturesSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const features =
            await this.featureService.getMetadataForAllFeaturesByProjectId(
                true,
                projectId,
            );
        this.openApiService.respondWithValidation(
            200,
            res,
            featuresSchema.$id,
            { version: 2, features: serializeDates(features) },
        );
    }

    async deleteFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response<void>,
    ): Promise<void> {
        const { featureName } = req.params;
        const user = extractUsername(req);
        await this.featureService.deleteFeature(featureName, user);
        res.status(200).end();
    }

    async reviveFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response<void>,
    ): Promise<void> {
        const userName = extractUsername(req);
        const { featureName } = req.params;
        await this.featureService.reviveFeature(featureName, userName);
        res.status(200).end();
    }
}

module.exports = ArchiveController;
