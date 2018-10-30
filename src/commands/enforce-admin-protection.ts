import {flags} from '@oclif/command';
import cli from 'cli-ux';

import Command from '../base';

export class EnforceAdminProtection extends Command {
  static description = 'Disable/Enable `Include administrators` on develop and master branch protection';

  static examples = [
    `$ enforce-admin-protection test-repo  --enableProtection
initializing github client
What is your GitHub token?: ****************************************
Working with repo uw-it-edm/test-repo
getting repo uw-it-edm/test-repo
found repo uw-it-edm/test-repo -- public
enabled admin protection for develop
enabled admin protection for master
`,
  ];

  static flags = {
    ...Command.flags,
    enableProtection: flags.boolean({char: 'e', exclusive: ['disableProtection']}),
    disableProtection: flags.boolean({char: 'd', exclusive: ['enableProtection']})
  };

  static args = [
    ...Command.args,
  ];

  async run() {
    const {args, flags} = this.parse(EnforceAdminProtection);
    cli.log(`Working with repo ${flags.owner}/${args.repo}`);

    let repo = await super.githubClient.getRepo(flags.owner, args.repo);

    cli.log(`found repo ${repo.name}`);

    if (flags.enableProtection) {
      await this.githubClient.enableAdminProtection(flags.owner, args.repo);
    } else if (flags.disableProtection) {
      await this.githubClient.disableAdminProtection(flags.owner, args.repo);
    }
  }

}
