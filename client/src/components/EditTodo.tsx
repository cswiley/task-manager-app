import * as React from 'react'
import { Form, Button, Grid } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/todos-api'
import { History } from 'history'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  history: History
  auth: Auth
}

interface EditTodoState {
  file: any
  uploadState: UploadState
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  fileInputRef: React.RefObject<HTMLInputElement> = React.createRef()

  state: EditTodoState = {
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleCancel = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault()
    this.props.history.push(`/`)
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(
        this.props.auth.getIdToken(),
        this.props.match.params.todoId
      )

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)
      const fileInput = this.fileInputRef.current

      // Reset the value of the file input
      if (fileInput) {
        fileInput.value = ''
      }

      alert('File was uploaded!')

      // Go back to todo list
      this.props.history.push(`/`)
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type='file'
              accept='image/*'
              placeholder='Image to upload'
              onChange={this.handleFileChange}
              ref={this.fileInputRef}
            />
          </Form.Field>

          <Grid padded>
            <Grid.Row>
              {this.renderButton()}
              {this.renderCancelButton()}
            </Grid.Row>
          </Grid>
        </Form>
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && (
          <p>Uploading image metadata</p>
        )}
        {this.state.uploadState === UploadState.UploadingFile && (
          <p>Uploading file</p>
        )}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type='submit'
        >
          Upload
        </Button>
      </div>
    )
  }

  renderCancelButton() {
    return (
      <div>
        <Button type='reset' onClick={this.handleCancel}>
          Cancel
        </Button>
      </div>
    )
  }
}
