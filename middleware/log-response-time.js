require("dotenv").config();

const logResponseTime = function (req, res, next) {
    let start_time = Date.now()

    res.on('finish', () => {            
        let end_time = Date.now()
        let request_url = req.baseUrl
        let time_result = end_time - start_time
        console.log(request_url + " | " + time_result)
    })

    next()
};

module.exports = logResponseTime;
