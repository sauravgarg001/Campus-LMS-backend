const xlsx = require('xlsx');

let xlsxLib = {
    validateAndGetJson: (filename, fieldName) => {
        let file = __dirname.substring(0, __dirname.lastIndexOf('\\')) + `\\public\\sre\\${filename}`;
        let data = [];
        let workbook = xlsx.readFile(file);

        let sheet_name_list = workbook.SheetNames;
        if (sheet_name_list.length != 1 || sheet_name_list[0] != 'sheet 1') {
            console.log('Invalid Sheets');
            return null;
        }

        let worksheet = workbook.Sheets['sheet 1'];
        let headers = {};
        let check = true;


        for (cell in worksheet) {

            /**
             *      A
             * 1   Hello
             * 
             * cell -> A1
             * row -> 1
             * col -> A
             * worksheet[cell].v -> hello
             * 
             */

            if (cell[0] === '!') continue;
            //parse out the column, row, and value

            let index = -1; // where row number starts
            for (var i = 0; i < cell.length; i++) {
                if (!isNaN(cell[i])) {
                    index = i;
                    break;
                }
            };
            let col = cell.substring(0, index);
            let row = parseInt(cell.substring(index));

            let value = worksheet[cell].w; //cell value

            //store header names
            if (row == 1 && value) {
                headers[col] = value;
                continue;
            }

            if (row == 2 && check) { //validating headers
                if (xlsxLib.validateHeaders(Object.values(headers), fieldName) == false) {
                    console.log('Invalid Headers');
                    return null;
                }
                check = false;
            }

            if (!data[row])
                data[row] = {};
            data[row][headers[col]] = value;
        }
        //drop those first two rows which are empty
        data.shift();
        data.shift();

        return data;
    },

    validateHeaders: (headers, fieldName) => {
        let check = xlsxLib.getHeaders(fieldName);
        return check.every(header => headers.includes(header));
    },

    getHeaders: (fieldName) => {
        if (fieldName == 'students') {
            return ['Roll Number', 'Sap Id', 'First Name', 'Middle Name', 'Last Name', 'Gender', 'Mobile Number', 'Date of Birth', 'Degree', 'School', 'Specialization', 'Batch', 'Year of Passing'];
        } else if (fieldName == 'batches') {
            return ['Degree', 'School', 'Specialization', 'Number of Batches', 'Year of Passing'];
        } else if (fieldName == 'programmes') {
            return ['Degree', 'School', 'Specialization'];
        } else if (fieldName == 'faculties') {
            return ['Sap Id', 'First Name', 'Middle Name', 'Last Name', 'Gender', 'Mobile Number', 'Date of Birth', 'School', 'Department', 'Specialization'];
        }
    }
}

module.exports = xlsxLib;