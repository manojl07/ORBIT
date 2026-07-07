class ApiResponse{
  constructor(statusCode, message="success", data=null){
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;