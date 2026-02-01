//const dropArea = document.getElementById('drop-area');
let dropArea;
let table;
let droped_files = [];
let file_names = [];

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
    for (let i = 0; i < files.length; i++) {
        const row = table.insertRow(-1);
        //create list of n cells added to row
        let cells = [];
        for (let j = 0; j < 5; j++) {
            cells[j] = row.insertCell(j);
        }
        /*const cell1 = row.insertCell(0);
        cell2.innerHTML = files[i].name;
        const cell2 = row.insertCell(1);
        //date

        const cell3 = row.insertCell(2);
        //subject line
        cell3.innerHTML = "Subject";
        const cell4 = row.insertCell(3);
        //message summary
        cell4.innerHTML = "Message Summary";
        */
        //FileReader(files[i], row);        
        const filereader = new FileReader();
        filereader.readAsText(files[i]);
        filereader.onload = function(e) {
            const result = e.target.result;
            /*
                <th>file name</th>
                <th>sender</th>
                <th>date</th>
                <th>subject</th>
                <th>message summary</th>
            */
            cells[0].innerHTML = files[i].name;
            if (file_names.includes(files[i].name)) {
                cells[0].parentNode.style.backgroundColor = '#ffc107'; //yellow
            }
            file_names.push(files[i].name);
            cells[1].innerHTML = getEMLattribute(result, "From");
            cells[2].innerHTML = getEMLattribute(result, "Date");
            cells[3].innerHTML = getEMLattribute(result, "Subject");
            cells[4].innerHTML = getEmlBody(result).substring(0, 100) + '...';
            //check that no cells are empty
            for (let k = 0; k < cells.length; k++) {
                if (cells[k].innerHTML === '') {
                    const parentRow = cells[k].parentNode;
                    if (parentRow.style.backgroundColor !== 'rgb(255, 193, 7)') { //not yellow
                        parentRow.style.backgroundColor = '#f8d7da'; //light red
                    }
                        cells[k].style.backgroundColor = '#bc0e1c'; //dark red
                }
            }
        }
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

