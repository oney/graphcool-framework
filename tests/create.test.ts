import test from 'ava'
import TestResolver from '../src/system/TestResolver'
const fetchMock = require('fetch-mock')
const debug = require('debug')('graphcool')
import createCommand from '../src/commands/init'
import {
  systemAPIEndpoint,
  graphcoolProjectFileName, graphcoolConfigFilePath
} from '../src/utils/constants'
import {mockedCreateProjectResponse, mockProjectFile1} from './mock_data/mockData'
import {simpleTwitterSchema} from './mock_data/schemas'

import 'isomorphic-fetch'
import {readProjectIdFromProjectFile} from '../src/utils/file'
import {SystemEnvironment} from '../src/types'
import TestOut from '../src/system/TestOut'

/**
 Options:
 -u, --url <schema-url>    Url to a GraphQL schema
 -f, --file <schema-file>  Local GraphQL schema file
 -n, --name <name>         Project name
 -a, --alias <alias>       Project alias
 -r, --region <region>     AWS Region (default: us-west-2)
 -h, --help                Output usage information

 Note: This command will create a ${chalk.bold('project.graphcool')} config file in the current directory.
*/

// test.afterEach(() => {
//   fetchMock.reset()
// })

/*
 * Test succeeding project creation and verify project info is stored in in ./project2.graphcool
 */
test('Succeeding project creation with local schema file', async t => {

  // configure HTTP mocks
  fetchMock.post(systemAPIEndpoint, JSON.parse(mockedCreateProjectResponse))
  debug(`Expect resonse: ${JSON.stringify(mockedCreateProjectResponse)}`)


  const result = await fetch(systemAPIEndpoint, {
    method: 'POST',
    body: JSON.stringify({}),
  })
  const json = await result.json()

  debug(`Actual resonse: ${JSON.stringify(json)}`)
  //
  //
  // t.pass()
  // create dummy project data
  const name = 'My Project'
  const schema = simpleTwitterSchema
  const localSchemaFile = './myproject.graphql'
  const props = { name, localSchemaFile }

  const storage = {}
  storage[localSchemaFile] = simpleTwitterSchema
  storage[graphcoolConfigFilePath] = '{"token": "abcdefgh"}'
  const env = testEnvironment(storage)

  await t.notThrows(
    createCommand(props, env)
  )

  const expectedProjectFileContent = mockProjectFile1
  t.is(env.resolver.read(graphcoolProjectFileName), expectedProjectFileContent)
  t.is(readProjectIdFromProjectFile(env.resolver, graphcoolProjectFileName), 'abcdefghijklmn')
})

// test('Succeeding project creation with remote schema file', async t => {
//
//   // configure HTTP mocks
//   fetchMock.post(systemAPIEndpoint, JSON.parse(mockedCreateProjectResponse))
//   const remoteSchemaUrl = 'https://graphqlbin/project.schema'
//   const schema = simpleTwitterSchema
//   fetchMock.get(remoteSchemaUrl, schema)
//
//   // create dummy project data
//   const name = 'MyProject'
//   const props = { name, remoteSchemaUrl }
//
//   const storage = {}
//   storage[graphcoolConfigFilePath] = '{"token": "abcdefgh"}'
//   const env = testEnvironment(storage)
//
//   await t.notThrows(
//     createCommand(props, env)
//   )
//
//   const expectedProjectFileContent = mockProjectFile1
//   t.is(env.resolver.read(graphcoolProjectFileName), expectedProjectFileContent)
//   t.is(readProjectIdFromProjectFile(env.resolver, graphcoolProjectFileName), 'abcdefghijklmn')
// })

function testEnvironment(storage: any): SystemEnvironment {
  return {
    resolver: new TestResolver(storage),
    out: new TestOut()
  }
}
