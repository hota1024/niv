import { Command, flags } from '@oclif/command'
import * as chalk from 'chalk'
import * as inquirer from 'inquirer'
import { promisify } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import { spawn } from 'child_process'

class Niv extends Command {
  static description = 'describe the command here'

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'package-json', description: 'package.json path', default: 'package.json' }]

  async run() {
    const { args } = this.parse(Niv)
    const cwd = process.cwd()
    const packageJsonPath = path.join(cwd, args['package-json'])
    const pkg: { scripts?: { [name: string]: string } } = JSON.parse((await promisify(fs.readFile)(packageJsonPath)).toString())

    if (!pkg.scripts) {
      this.error(`${packageJsonPath} have'nt "scripts" field.`)
    }

    const maxNameLength = Object.entries(pkg.scripts).reduce((value, [name]) => Math.max(value, name.length), -Infinity)

    const { script } = await inquirer.prompt<{ script: string }>([{
      name: 'script',
      message: 'choice a script to run - ctrl + c to cancel',
      type: 'list',
      choices: Object.entries(pkg.scripts).map(([name, script]) => ({
        name: `${name}${' '.repeat(maxNameLength - name.length + 1)}${chalk.grey(`- ${script}`)}`,
        value: name
      }))
    }])

    const npmArgs = ['run', script]

    this.log(`🚀 Run the ${chalk.cyan(`"${script}"`)} script`)
    const child = spawn(`npm`, npmArgs, { cwd, stdio: 'inherit' })

    child.on('close', (code) => {
    })
  }
}

export = Niv
