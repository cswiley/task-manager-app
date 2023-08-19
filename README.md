# Cloud Capstone Project

## Project Title

Task manager

## Project Description

Simple task manager application that allows users to enter tasks and assign each a name, image, priority, and due date.

## Project Features

- Users need to authenticate to use the application.
- Users can only see their own tasks.
- New tasks can have a name, due date, and priority of (low, medium, high).
- After a task is created, an image can be added to the task using the pencil icon.
- A task status can be marked as "done" using the toggle button.
- Tasks can be filtered by priority or status.
- Tasks can be deleted using the 'x' icon.
- Tasks are sorted by most-recent-due-date by default.
- Task list is paginated at 10 items-per-page by default.

## Technologies and Tools

[List the technologies and tools you plan to use]

- Serverless backend architecture
- HTTP API using AWS API Gateway as a proxy
- Lambda functions associated with API methods
- DynamoDB as a data store
- S3 as file store
- Auth0 as authentication provider
- Lamdba as custom authorizer
- Integration tests on Postman

## Success Criteria

### Functionality

[x] The application allows users to create, update, delete items

[x] The application allows users to upload a file.

[x] The application only displays items for a logged in user.

[x] Authentication is implemented and does not allow unauthenticated access.

### Code Base

[x] The code is split into multiple layers separating business logic from I/O related code.

[x] Code is implemented using async/await and Promises without using callbacks.

### Best Practice

[x] All resources in the application are defined in the "serverless.yml" file

[x] Each function has its own set of permissions.

[x] Application has sufficient monitoring.

[x] HTTP requests are validated

### Architecture

[x] Data is stored in a table with a composite key.

[x] Scan operation is not used to read data from a database.
