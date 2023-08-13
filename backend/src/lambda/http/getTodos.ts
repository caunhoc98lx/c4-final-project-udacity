import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

// import {getTodosForUser as getTodosForUser} from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { getAllTodosByUserId } from '../../helpers/todos'

// TODO: Get all TODO items for a current user
const logger = createLogger('lambdaGetUser')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    logger.info('userId: ' + userId)

    const result = await getAllTodosByUserId(userId)
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
