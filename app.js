
const fetchData = async () => {
    const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
    const data = await response.json();
    return data;
};


const renderTable = (users, currentPage, pageSize) => {
    const tableHead = $('#userTable thead');
    const tableBody = $('#userTable tbody');

    tableHead.empty();
    tableBody.empty();


    const headerRow = $('<tr>');
    Object.keys(users[0]).forEach(key => {
        headerRow.append($('<th>').text(key));
    });
    tableHead.append(headerRow);


    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageUsers = users.slice(startIndex, endIndex);

    currentPageUsers.forEach(user => {
        const row = $('<tr>');
        Object.values(user).forEach(value => {
            row.append($('<td>').text(value));
        });
        row.append('<td>' +
            '<button class="btn btn-warning edit-btn" onclick="editRow(' + users.indexOf(user) + ')">Edit</button>' +
            '<button class="btn btn-danger delete-btn">Delete</button>' +
            '</td>');
        tableBody.append(row);
    });
};


const handlePagination = (page, pageSize, totalRecords) => {
    const totalPages = Math.ceil(totalRecords / pageSize);
    const pageNumbers = $('.page-numbers');
    pageNumbers.text(`Page ${page} of ${totalPages}`);


    $('.first-page').prop('disabled', page === 1);
    $('.previous-page').prop('disabled', page === 1);
    $('.next-page').prop('disabled', page === totalPages);
    $('.last-page').prop('disabled', page === totalPages);
};


const init = async () => {
    
    let users = await fetchData();

    const pageSize = 10;
    let currentPage = 1;
    let selectedRows = [];

    
    renderTable(users, currentPage, pageSize);

    handlePagination(currentPage, pageSize, users.length);

    $('#searchBtn').on('click', () => {
        const searchTerm = $('#search').val().toLowerCase();
        const filteredUsers = users.filter(user =>
            Object.values(user).some(value => value.toString().toLowerCase().includes(searchTerm))
        );
        renderTable(filteredUsers, 1, pageSize);
        currentPage = 1;
        handlePagination(currentPage, pageSize, filteredUsers.length);
    });
    $('#search').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const filteredUsers = users.filter(user =>
            Object.values(user).some(value => value.toString().toLowerCase().includes(searchTerm))
        );
        renderTable(filteredUsers, 1, pageSize);
        currentPage = 1;
        handlePagination(currentPage, pageSize, filteredUsers.length);
    });

    
    $('#search').on('keypress', function (e) {
        if (e.key === 'Enter') {
            const searchTerm = $(this).val().toLowerCase();
            const filteredUsers = users.filter(user =>
                Object.values(user).some(value => value.toString().toLowerCase().includes(searchTerm))
            );
            renderTable(filteredUsers, 1, pageSize);
            currentPage = 1;
            handlePagination(currentPage, pageSize, filteredUsers.length);
        }
    });

    $('.first-page').on('click', () => {
        renderTable(users, 1, pageSize);
        currentPage = 1;
        handlePagination(currentPage, pageSize, users.length);
    });

    $('.previous-page').on('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(users, currentPage, pageSize);
            handlePagination(currentPage, pageSize, users.length);
        }
    });

    $('.next-page').on('click', () => {
        const totalPages = Math.ceil(users.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(users, currentPage, pageSize);
            handlePagination(currentPage, pageSize, users.length);
        }
    });

    $('.last-page').on('click', () => {
        const totalPages = Math.ceil(users.length / pageSize);
        renderTable(users, totalPages, pageSize);
        currentPage = totalPages;
        handlePagination(currentPage, pageSize, users.length);
    });

    $('#selectAll').on('change', function () {
        const isChecked = $(this).prop('checked');
        selectedRows = isChecked ? users.slice((currentPage - 1) * pageSize, currentPage * pageSize) : [];
        $('.checkbox-label').toggleClass('checked', isChecked);
    });

    $('#userTable').on('change', 'tbody input[type="checkbox"]', function () {
        const isChecked = $(this).prop('checked');
        const userId = $(this).closest('tr').find('td:first').text();

        if (isChecked) {
            selectedRows.push(users.find(user => user.id === userId));
        } else {
            selectedRows = selectedRows.filter(user => user.id !== userId);
        }

        const allCheckboxes = $('#userTable tbody input[type="checkbox"]');
        const allChecked = selectedRows.length === pageSize && pageSize === allCheckboxes.length;
        $('#selectAll').prop('checked', allChecked);
        $('.checkbox-label').toggleClass('checked', allChecked);
    });

    $('#deleteSelected').on('click', () => {
        if (selectedRows.length > 0) {
            users = users.filter(user => !selectedRows.some(selected => selected.id === user.id));
            renderTable(users, currentPage, pageSize);
            selectedRows = [];
            handlePagination(currentPage, pageSize, users.length);
            alert('Delete Successful');
        }
    });

   
    $('#userTable').on('click', '.edit-btn', function () {
        const index = $(this).closest('tr').index();
        editRow(index);
    });

 
    $('#userTable').on('click', '.delete-btn', function () {
        const userId = $(this).closest('tr').find('td:first').text();
        users = users.filter(user => user.id !== userId);

      
        renderTable(users, currentPage, pageSize);

        selectedRows = [];

        handlePagination(currentPage, pageSize, users.length);

        alert('Delete Successful');
    });
    function editRow(index) {
        var modal = $('#editModal');
        var form = $('#editForm');
        var saveChangesBtn = $('#saveChanges');

        $('#editName').val(users[index].name);
        $('#editEmail').val(users[index].email);
        $('#editRole').val(users[index].role);

        modal.modal('show');

        saveChangesBtn.off('click').on('click', function () {
          
            users[index].name = $('#editName').val();
            users[index].email = $('#editEmail').val();
            users[index].role = $('#editRole').val();
            renderTable(users, currentPage, pageSize);

        
            modal.modal('hide');

            alert('Update Successful');
        });
    }
};

init();
