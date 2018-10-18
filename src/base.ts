import Command, {flags} from '@oclif/command';
import {cli} from 'cli-ux';

import {GithubClient} from './service/github-client';

export default abstract class extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    ghToken: flags.string({char: 't', description: 'Github Token for authentication'}),
    owner: flags.string({char: 'o', required: true, default: 'uw-it-edm'}),
    //dryRun: flags.boolean({char: 'd'})
  };

  static args = [
    {name: 'repo', required: true}
  ];

  protected flags: any;
  protected args: any;
  private _githubClient: GithubClient = new GithubClient('');

  async init() {
    // do some initialization
    cli.log('initializing github client');
    // @ts-ignore
    const {flags} = this.parse(this.constructor);

    let ghToken;
    if (flags.ghToken !== undefined) {
      ghToken = flags.ghToken;
    } else {
      ghToken = await cli.prompt('What is your GitHub token?', {type: 'hide'});
    }

    this.githubClient = new GithubClient(ghToken);
  }

  async catch(err: any) {
    // handle any error from the command
    cli.log(err.message);
  }

  get githubClient(): GithubClient {
    return this._githubClient;
  }

  set githubClient(value: GithubClient) {
    this._githubClient = value;
  }

}
