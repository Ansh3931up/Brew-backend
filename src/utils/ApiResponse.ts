export class ApiResponse<T = unknown> {
  public readonly success: boolean
  public readonly data?: T
  public readonly message?: string
  public readonly error?: string
  public readonly code?: string
  public readonly errors?: Record<string, string[]>
  public readonly timestamp: string

  constructor(
    success: boolean,
    data?: T,
    message?: string,
    error?: string,
    code?: string,
    errors?: Record<string, string[]>
  ) {
    this.success = success
    this.data = data
    this.message = message
    this.error = error
    this.code = code
    this.errors = errors
    this.timestamp = new Date().toISOString()
  }

  // Static factory methods for success responses
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse<T>(true, data, message)
  }

  // Static factory methods for error responses
  static error(
    error: string,
    code?: string,
    errors?: Record<string, string[]>
  ): ApiResponse {
    return new ApiResponse(false, undefined, undefined, error, code, errors)
  }

  // Convert to JSON for Express response
  toJSON(): Record<string, unknown> {
    const response: Record<string, unknown> = {
      success: this.success,
      timestamp: this.timestamp
    }

    if (this.data !== undefined) {
      response.data = this.data
    }

    if (this.message) {
      response.message = this.message
    }

    if (this.error) {
      response.error = this.error
    }

    if (this.code) {
      response.code = this.code
    }

    if (this.errors) {
      response.errors = this.errors
    }

    return response
  }
}
