const DEFAULT_DESCRIPTION = 'Invalid request';

class BadRequestMessage {
    static fromError(errorMessage) {
        return {
            message: DEFAULT_DESCRIPTION,
            errors: [
                { message: errorMessage }
            ]
        };
    }

    static fromErrors(errorMessages) {
        return {
            message: DEFAULT_DESCRIPTION,
            errors: errorMessages.map(err => { return { message: err }; })
        };
    }
}

module.exports = BadRequestMessage;