const path = require('path')
const fs   = require('fs');

const base_path     = './libs/electoralRegister';
const electoralDict = {};

// read file at once page has been loaded to avoid loop loading
fs.readdirSync(base_path).forEach(function(filename){
    if (filename.includes('.csv')){
        const file_path = path.join(base_path, filename);
        const csvData   = fs.readFileSync(file_path, 'utf8');
        const availableStudentList = csvData.split(/\r?\n/).slice(1);
        const availableStudentIds  = availableStudentList.map((student) => student.split(',')[1]);
        electoralDict[filename.split('.')[0]] = availableStudentIds;
    }
});

module.exports = {
    validate(activity_name, student_id) {
        try {
            if (electoralDict[activity_name].includes(student_id))
                return true;
        } catch(error) {
            console.log(error);
        }
        return false;
    }
};