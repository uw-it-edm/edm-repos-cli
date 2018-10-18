import * as Github from '@octokit/rest';
import cli from 'cli-ux';

export class GithubClient {
  private readonly oktokit: Github;

  constructor(ghToken: string) {
    this.oktokit = new Github();
    this.oktokit.authenticate({type: 'token', token: ghToken});
  }

  async enableAdminProtection(owner: string, repoName: string) {
    await this.enableBranchProtectionForBranch(owner, repoName, 'develop');
    await this.enableBranchProtectionForBranch(owner, repoName, 'master');
  }

  async disableAdminProtection(owner: string, repoName: string) {
    await this.disableAdminProtectionForBranch(owner, repoName, 'develop');
    await this.disableAdminProtectionForBranch(owner, repoName, 'master');
  }

  async addTravisBranchProtections(owner: string, repoName: string, developBranch: boolean, masterBranch: boolean) {
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
    updateBranchProtectionParam.required_status_checks.contexts = [
      'Travis CI - Branch',
      'Travis CI - Pull Request'
    ];

    updateBranchProtectionParam.restrictions = {} as Github.ReposUpdateBranchProtectionParamsRestrictions;
    updateBranchProtectionParam.restrictions.teams = [];
    updateBranchProtectionParam.restrictions.users = [];

    if (developBranch) {
      updateBranchProtectionParam.branch = 'develop';
      let response: Github.Response<Github.ReposUpdateBranchProtectionResponse> = await this.oktokit.repos.updateBranchProtection(updateBranchProtectionParam);

      cli.info('Added develop branch protection. Response status ' + response.status);
      cli.debug(JSON.stringify(response.data, null, 4));
    }
    if (masterBranch) {
      updateBranchProtectionParam.branch = 'master';
      let response: Github.Response<Github.ReposUpdateBranchProtectionResponse> = await this.oktokit.repos.updateBranchProtection(updateBranchProtectionParam);

      cli.info('Added master branch protection. Response status ' + response.status);
      cli.debug(JSON.stringify(response.data, null, 4));
    }

  }

  async getRepo(owner: string, repoName: string): Promise<Github.ReposGetResponse> {
    cli.log(`getting repo ${owner}/${repoName}`);

    let getParam: Github.ReposGetParams = {} as Github.ReposGetParams;
    let branchProtectionParam: Github.ReposGetBranchProtectionParams = {} as Github.ReposGetBranchProtectionParams;

    getParam.owner = owner;
    getParam.repo = repoName;

    branchProtectionParam.owner = owner;
    branchProtectionParam.repo = repoName;
    branchProtectionParam.branch = 'develop';

    const repo: Github.Response<Github.ReposGetResponse> = await this.oktokit.repos.get(getParam);

    if (repo.status < 200 || repo.status > 299) {
      cli.error(`no repo for ${owner}/ ${repoName}`);
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

    const response: Github.Response<Github.ReposAddProtectedBranchAdminEnforcementResponse> = await this.oktokit.repos.addProtectedBranchAdminEnforcement(params);

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

    const response: Github.Response<Github.AnyResponse> = await this.oktokit.repos.removeProtectedBranchAdminEnforcement(params);

    if (response.status >= 200 && response.status < 299) {
      cli.log(`disabled admin protection for ${params.branch}`);
    } else {
      throw new Error(`couldn't enable admin protection for ${params.branch} : ${response.status} -- ${JSON.stringify(response.data)}`);
    }
  }
}
