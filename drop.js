let dropArea;
let table;
let droped_files = [];


const email_files = {
    rows: [],
};

function changeCharacterLength() {
    const maxStringLength = parseInt(document.getElementById('message-summary-length').value);
    email_files.update(maxStringLength);
}


function downloadJsonObject() {
    // 1. Define your JavaScript object
    const dataObject = email_files.rows;

    // 2. Convert the object to a JSON string
    const jsonString = JSON.stringify(dataObject, null, 2); // 'null, 2' for pretty formatting

    // 3. Create a Blob object with the JSON data and specify the MIME type
    const blob = new Blob([jsonString], { type: "application/json" });

    // 4. Generate a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // 5. Create a temporary anchor element and set its attributes
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'data_object.json'; // Set the desired file name

    // 6. Append link to body, trigger the click, and remove the link
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // 7. Revoke the temporary URL to free up resources
    URL.revokeObjectURL(url);
}


email_files.update = function(maxStringLength=100) {

    //clear the table
    table.replaceChildren();
    
    //draw header
    const header = table.insertRow(0);
    for (const [attribute_name, attribute_function] of Object.entries(this.rows[0])) {
        header.insertCell().innerHTML = attribute_name;
    }

    //draw the row in the table
    for (const row of this.rows) {
        const table_row = table.insertRow();
        for (const [attribute_name, attribute_function] of Object.entries(row)) {
            const cell = table_row.insertCell();
            cell.innerHTML = row[attribute_name].toString().substring(0, maxStringLength) || '';
        }
        //add remove button
        const remove_cell = table_row.insertCell();
        const remove_button = document.createElement('button');
        remove_button.innerHTML = 'Remove';
        remove_button.onclick = () => {
            const row_index = Array.from(table.rows).indexOf(table_row) - 1; //adjust for header row
            email_files.rows.splice(row_index, 1);
            email_files.update(maxStringLength);
        };
        remove_cell.appendChild(remove_button);
    }

    //highlight duplicate file names
    const filename_counts = {};
    for (const row of table.rows) {
        const filename = row.cells[0].innerHTML;
        if (filename in filename_counts) {
            filename_counts[filename] += 1;
        } else {
            filename_counts[filename] = 1;
        }
    }
    for (const row of table.rows) {
        const filename = row.cells[0].innerHTML;
        if (filename_counts[filename] > 1) {
            row.style.backgroundColor = '#ffc107'; //yellow
        }
    }

    //highlight rows with missing attributes
    for (const row of table.rows) {
        for (const cell of row.cells) {
            if (cell.innerHTML === '') {
                const parentRow = cell.parentNode;
                if (parentRow.style.backgroundColor !== 'rgb(255, 193, 7)') { //not yellow
                    parentRow.style.backgroundColor = '#f8d7da'; //light red
                }
                cell.style.backgroundColor = '#bc0e1c'; //dark red
            }
        }
    }
};

email_files.sortByDate = function(order = 'desc') {
    this.rows.sort((a, b) => {
        if (order === 'asc') {
            return new Date(a.date) - new Date(b.date);
        } else if (order === 'desc') {
            return new Date(b.date) - new Date(a.date);
        }
    });
}

function parseEmlFile(file, attribute_list) {
     const filereader = new FileReader();
        filereader.readAsText(file);
        filereader.onload = (e) => {
            const result = e.target.result;
            
            const date = new Date(getEMLattribute(result, "Date"));
            const filename = file.name;
            const email_message = getEmlBody(result);

            const email_file = {
                filename: filename,
                date: date.toString() === 'Invalid Date' ? '' : date,
                message: email_message
            };

            for (const [attribute_name, attribute_function] of Object.entries(attribute_list)) {
                const attribute_value = attribute_function(result);
                email_file[attribute_name] = attribute_value;
            }
            
            email_files.rows.push(email_file);
            email_files.sortByDate('desc');
            email_files.update();
        }
}

document.addEventListener('DOMContentLoaded', (event) => {
    dropArea = document.getElementById('drop-area');
     table = document.getElementById('file-table');

    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.style.borderColor = '#000';
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '#ccc';
    });

    dropArea.addEventListener('drop', handleDrop);
});



function handleDrop(event) {
    event.preventDefault();
    dropArea.style.borderColor = '#ccc';
    const files = event.dataTransfer.files;
    console.log(files); // Handle the files here
    droped_files.push(...files);
    for (const file of files) {


        parseEmlFile(file, {
            "From": (emlContent) => getEMLattribute(emlContent, "From"),
            "Subject": (emlContent) => getEMLattribute(emlContent, "Subject"),
        });
    }
}

function getEMLattribute(emlContent, attribute) {
    const regex = new RegExp(`^${attribute}: (.*)$`, 'm');
    const match = emlContent.match(regex);
    return match ? match[1] : '';
}

function getEmlBody(emlContent) {
    // Split on any common newline sequence and find the first blank line
    const lines = emlContent.split(/\r\n|\r|\n/);
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '') {
            return lines.slice(i + 1).join('\n');
        }
    }
    // No blank line found — return empty string
    return '';
}

