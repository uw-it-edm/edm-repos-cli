import cli from 'cli-ux';

import Command from '../base';

export class AddBranchProtection extends Command {
  static description = 'describe the command here';

  static examples = [
    `$ edm-repos add-branch-protection test-repo
initializing github client
What is your GitHub token?: *****
Working with repo uw-it-edm/test-repo
getting repo uw-it-edm/test-repo
found repo uw-it-edm/test-repo -- public
Added develop branch protection. Response status 200
Added master branch protection. Response status 200
`,
  ];

  static flags = {
    ...Command.flags
  };

  static args = [
    ...Command.args,
  ];

  async run() {
    const {args, flags} = this.parse(AddBranchProtection);
    cli.log(`Working with repo ${flags.owner}/${args.repo}`);

    let repo = await super.githubClient.getRepo(flags.owner, args.repo);

    //TODO create repo if doesn't exist ?  ( https://octokit.github.io/rest.js/#api-Repos-create. Turn on `auto_init` and created develop and master branch using https://octokit.github.io/rest.js/#api-Gitdata-createReference

    await this.githubClient.addTravisBranchProtections(flags.owner, repo.name, true, true);
  }

}
