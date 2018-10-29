import * as Github from '@octokit/rest';
import cli from 'cli-ux';

export type GHPermissions = 'pull' | 'push' | 'admin';

export class GithubClient {
  private readonly octokit: Github;

  constructor(ghToken: string) {
    this.octokit = new Github();
    if (ghToken && ghToken.length > 0) {
      this.octokit.authenticate({type: 'token', token: ghToken});
    }
  }

  async addTeamsToRepo(owner: string, repoName: string, teams: string[], permission: GHPermissions) {
    cli.info(`trying to add teams ${JSON.stringify(teams)} to repo ${this.getSlug(owner, repoName)}`);
    let teamsToProcess = new Map<string, number>();

    const getTeamsParams = {} as Github.OrgsGetTeamsParams;
    getTeamsParams.org = owner;

    let teamsResponse: Github.Response<Github.OrgsGetTeamsResponse> = await this.octokit.orgs.getTeams(getTeamsParams);

    if (teamsResponse.status < 200 || teamsResponse.status > 299) {
      cli.error(`no teams for ${owner}`);
      cli.debug(`Teams not found ${JSON.stringify(teamsResponse, null, 4)}`);
      throw new Error(`couldn't fetch teams for org ${owner} --${JSON.stringify(teamsResponse, null, 4)} `);
    } else {
      cli.debug(`found teams ${JSON.stringify(teamsResponse.data, null, 4)}`);
    }

    teamsResponse.data.forEach(function (team) {
      if (teams.includes(team.name)) {
        teamsToProcess.set(team.name, team.id);
      }
    });

    if (teams.length !== teamsToProcess.size) {
      throw new Error(`Some teams where not found. Requested ${JSON.stringify(teams)}, got ${JSON.stringify(teamsToProcess)} `);
    } else {
      teamsToProcess.forEach(async (teamId: number, teamName: string) => {
        cli.log(`adding ${teamName} -- ${teamId} with permission "${permission}" to ${this.getSlug(owner, repoName)} `);
        let addTeamRepoParams = {} as Github.OrgsAddTeamRepoParams;
        addTeamRepoParams.owner = owner;
        addTeamRepoParams.repo = repoName;
        addTeamRepoParams.team_id = teamId;
        addTeamRepoParams.permission = permission;

        let response: Github.Response<Github.OrgsAddTeamRepoResponse> = await this.octokit.orgs.addTeamRepo(addTeamRepoParams);

        if (response.status < 200 || response.status > 299) {
          cli.error(`couldn't add permission, got error ${JSON.stringify(response.status)}`);
          cli.debug(`couldn't add permission ${JSON.stringify(response, null, 4)}`);
        } else {
          cli.debug(`added permission ${JSON.stringify(response.data, null, 4)}`);
        }
      });
    }
  }

  async enableAdminProtection(owner: string, repoName: string) {
    await this.enableBranchProtectionForBranch(owner, repoName, 'develop');
    await this.enableBranchProtectionForBranch(owner, repoName, 'master');
  }

  async disableAdminProtection(owner: string, repoName: string) {
    await this.disableAdminProtectionForBranch(owner, repoName, 'develop');
    await this.disableAdminProtectionForBranch(owner, repoName, 'master');
  }

  async addTravisBranchProtections(owner: string, repoName: string, developBranch: boolean, masterBranch: boolean, disableTravisCheck: boolean) {
    //TODO check if both develop and master branches are present

    const updateBranchProtectionParam = {} as Github.ReposUpdateBranchProtectionParams;

    updateBranchProtectionParam.owner = owner;
    updateBranchProtectionParam.repo = repoName;

    updateBranchProtectionParam.branch = 'develop';

    updateBranchProtectionParam.enforce_admins = true;

    updateBranchProtectionParam.required_pull_request_reviews = {} as Github.ReposUpdateBranchProtectionParamsRequiredPullRequestReviews;
    updateBranchProtectionParam.required_pull_request_reviews.dismiss_stale_reviews = true;
    updateBranchProtectionParam.required_pull_request_reviews.require_code_owner_reviews = false;

    updateBranchProtectionParam.required_status_checks = {} as Github.ReposUpdateBranchProtectionParamsRequiredStatusChecks;
    updateBranchProtectionParam.required_status_checks.strict = true;

    if (disableTravisCheck) {
      updateBranchProtectionParam.required_status_checks.contexts = [];
    } else {
      updateBranchProtectionParam.required_status_checks.contexts = [
        'Travis CI - Branch',
        'Travis CI - Pull Request'
      ];
    }

    updateBranchProtectionParam.restrictions = {} as Github.ReposUpdateBranchProtectionParamsRestrictions;
    updateBranchProtectionParam.restrictions.teams = [];
    updateBranchProtectionParam.restrictions.users = [];

    if (developBranch) {
      updateBranchProtectionParam.branch = 'develop';
      let response: Github.Response<Github.ReposUpdateBranchProtectionResponse> = await this.octokit.repos.updateBranchProtection(updateBranchProtectionParam);

      cli.info('Added develop branch protection. Response status ' + response.status);
      cli.debug(JSON.stringify(response.data, null, 4));
    }
    if (masterBranch) {
      updateBranchProtectionParam.branch = 'master';
      let response: Github.Response<Github.ReposUpdateBranchProtectionResponse> = await this.octokit.repos.updateBranchProtection(updateBranchProtectionParam);

      cli.info('Added master branch protection. Response status ' + response.status);
      cli.debug(JSON.stringify(response.data, null, 4));
    }

  }

  async getRepo(owner: string, repoName: string): Promise<Github.ReposGetResponse> {
    cli.log(`getting repo ${this.getSlug(owner, repoName)}`);

    let getParam: Github.ReposGetParams = {} as Github.ReposGetParams;
    let branchProtectionParam: Github.ReposGetBranchProtectionParams = {} as Github.ReposGetBranchProtectionParams;

    getParam.owner = owner;
    getParam.repo = repoName;

    branchProtectionParam.owner = owner;
    branchProtectionParam.repo = repoName;
    branchProtectionParam.branch = 'develop';

    const repo: Github.Response<Github.ReposGetResponse> = await this.octokit.repos.get(getParam);

    if (repo.status < 200 || repo.status > 299) {
      cli.error(`no repo for ${this.getSlug(owner, repoName)}`);
      cli.debug(`repo not found ${JSON.stringify(repo, null, 4)}`);
    } else {
      cli.debug(`found repo ${JSON.stringify(repo.data, null, 4)}`);
    }

    let repoData: Github.ReposGetResponse = repo.data;
    cli.log('found repo ' + repoData.full_name + ' -- ' + (repoData.private ? 'private' : 'public'));

    return repoData;
  }

  private async enableBranchProtectionForBranch(owner: string, repoName: string, branch: string) {
    const params = {} as Github.ReposAddProtectedBranchAdminEnforcementParams;
    params.branch = branch;
    params.owner = owner;
    params.repo = repoName;

    const response: Github.Response<Github.ReposAddProtectedBranchAdminEnforcementResponse> = await this.octokit.repos.addProtectedBranchAdminEnforcement(params);

    if (response.status >= 200 && response.status < 299) {
      cli.log(`enabled admin protection for ${params.branch}`);
    } else {
      throw new Error(`couldn't enable admin protection for ${params.branch} : ${response.status} -- ${JSON.stringify(response.data)}`);
    }
  }

  private async disableAdminProtectionForBranch(owner: string, repoName: string, branch: string) {
    const params = {} as Github.ReposAddProtectedBranchAdminEnforcementParams;

    params.branch = branch;
    params.owner = owner;
    params.repo = repoName;

    const response: Github.Response<Github.AnyResponse> = await this.octokit.repos.removeProtectedBranchAdminEnforcement(params);

    if (response.status >= 200 && response.status < 299) {
      cli.log(`disabled admin protection for ${params.branch}`);
    } else {
      throw new Error(`couldn't enable admin protection for ${params.branch} : ${response.status} -- ${JSON.stringify(response.data)}`);
    }
  }

  private getSlug(owner: string, repoName: string) {
    return `${owner}/${repoName}`;
  }
}
