import {flags} from '@oclif/command';
import cli from 'cli-ux';

import Command from '../base';
import {GHPermissions} from '../service/github-client';

export class AddTeamsToRepo extends Command {
  static description = 'Add teams to repo';

  static examples = [
    `$ edm-repos add-teams-to-repo test-repo --team=test-team --permission=push
initializing github client
What is your GitHub token?: *****
Working with repo uw-it-edm/test-repo
getting repo uw-it-edm/test-repo
found repo uw-it-edm/test-repo -- public
trying to add teams ["test-team"] to repo uw-it-edm/test-repo
adding test-team -- 1234567 with permission "push" to uw-it-edm/test-repo
`,
  ];

  static flags = {
    ...Command.flags,
    team: flags.string({description: 'A team to add to the repo. Can be set multiple time to add more than one team', multiple: true}),
    permission: flags.string({
      description: 'The level of permission',
      default: 'pull',
      options: ['pull', 'push', 'admin'],
      required: true
    })
  };

  static args = [
    ...Command.args,
  ];

  async run() {
    const {args, flags} = this.parse(AddTeamsToRepo);
    cli.log(`Working with repo ${flags.owner}/${args.repo}`);

    let repo = await super.githubClient.getRepo(flags.owner, args.repo);

    await this.githubClient.addTeamsToRepo(flags.owner, repo.name, flags.team, flags.permission as GHPermissions);
  }

}
