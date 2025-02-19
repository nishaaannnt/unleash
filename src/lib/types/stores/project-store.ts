import {
    IEnvironmentProjectLink,
    IProjectMembersCount,
} from '../../db/project-store';
import {
    IEnvironment,
    IFeatureNaming,
    IProject,
    IProjectWithCount,
    ProjectMode,
} from '../model';
import { Store } from './store';
import { CreateFeatureStrategySchema } from '../../openapi';

export interface IProjectInsert {
    id: string;
    name: string;
    description: string;
    updatedAt?: Date;
    changeRequestsEnabled?: boolean;
    mode: ProjectMode;
    featureLimit?: number;
    featureNaming?: IFeatureNaming;
}

export interface IProjectSettings {
    mode: ProjectMode;
    defaultStickiness: string;
    featureLimit?: number;
    featureNamingPattern?: string;
    featureNamingExample?: string;
    featureNamingDescription?: string;
}

export interface IProjectSettingsRow {
    project_mode: ProjectMode;
    default_stickiness: string;
}

export interface IProjectEnvironmenDefaultStrategyRow {
    environment: string;
    default_strategy: any;
}

export interface IProjectArchived {
    id: string;
    archived: boolean;
}

export interface IProjectHealthUpdate {
    id: string;
    health: number;
}

export interface IProjectQuery {
    id?: string;
}

export type ProjectEnvironment = {
    environment: string;
    changeRequestEnabled?: boolean;
    defaultStrategy?: CreateFeatureStrategySchema;
};

export interface IProjectStore extends Store<IProject, string> {
    hasProject(id: string): Promise<boolean>;

    updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void>;

    create(project: IProjectInsert): Promise<IProject>;

    update(update: IProjectInsert): Promise<void>;

    importProjects(
        projects: IProjectInsert[],
        environments?: IEnvironment[],
    ): Promise<IProject[]>;

    addEnvironmentToProject(id: string, environment: string): Promise<void>;

    deleteEnvironmentForProject(id: string, environment: string): Promise<void>;

    getEnvironmentsForProject(id: string): Promise<ProjectEnvironment[]>;

    getMembersCountByProject(projectId: string): Promise<number>;

    getMembersCountByProjectAfterDate(
        projectId: string,
        date: string,
    ): Promise<number>;

    getProjectsByUser(userId: number): Promise<string[]>;

    getMembersCount(): Promise<IProjectMembersCount[]>;

    getProjectsWithCounts(
        query?: IProjectQuery,
        userId?: number,
    ): Promise<IProjectWithCount[]>;

    count(): Promise<number>;

    getAll(query?: IProjectQuery): Promise<IProject[]>;

    getProjectLinksForEnvironments(
        environments: string[],
    ): Promise<IEnvironmentProjectLink[]>;

    addEnvironmentToProjects(
        environment: string,
        projects: string[],
    ): Promise<void>;

    getDefaultStrategy(
        projectId: string,
        environment: string,
    ): Promise<CreateFeatureStrategySchema | null>;
    updateDefaultStrategy(
        projectId: string,
        environment: string,
        strategy: CreateFeatureStrategySchema,
    ): Promise<CreateFeatureStrategySchema>;

    isFeatureLimitReached(id: string): Promise<boolean>;
}
