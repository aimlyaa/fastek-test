
$( document ).ready(function() {
    // При открытии страницы сразу пытаемся получить список файлов с сервера
    getFilesNames();
    // Задаем тип файлового поля (множественное или единичное)
    updateFileInputType();
});

// Временное хранилище файлов
// Нужно чтобы при каждом новом выборе файлов предыдущие не затирались
var tmp_files = new Array();

// Меняет тип файлового поля
function updateFileInputType() {
    var selectedFileInputType = $("#fileInputType option:selected").val();
    
    if (selectedFileInputType == "single") {
      $("#getFileInput").attr('multiple', false);
    } else {
      $("#getFileInput").attr('multiple', true);
    }
    clearFileInput();
}

// Записывает загружаемые файлы в кастомное поле
function processSelectedFiles(fileInput) {
  var selectedFileInputType = $("#fileInputType option:selected").val();
  if (selectedFileInputType == "single") {

  }
  var files = fileInput.files;
  var filesStringForInput = "";
  // Записываем выбранные файлы в временный массив
  for (var i = 0; i < files.length; i++) {
    // Проверяем не добавлен ли уже этот файл
    var isFileAlreadySelected = false;
    tmp_files.forEach(tmp_file => {
      if (tmp_file.name == files[i].name) {
        isFileAlreadySelected = true;
      }
    });
    // Если не добавлен, то добавляем
    if (!isFileAlreadySelected) {
      tmp_files.push(files[i]);
    }
    
  }
  // Формируем строку с именами файлов и нужным разделителем
  for (var i = 0; i < tmp_files.length; i++) {
    var separator = "";
    if (i > 0) {
      separator = "; ";
    }
    filesStringForInput += separator + tmp_files[i].name;
  }
  // Записываем полученную строку в кастомный инпут
  $("#selectedFileInput").val(filesStringForInput);
}

// Функция отправки файлов на сервер
function uploadFiles() {
  var fd = new FormData();
  var file_data = tmp_files;

  for (var i = 0; i < file_data.length; i++) {
      fd.append( "file", file_data[i] );
  }

  $.ajax({
      url: 'upload_files',
      data: fd,
      contentType: false,
      processData: false,
      type: 'POST',
      async: false,
      success: function(data) {
          clearFileInput();
          getFilesNames();
      }
  });
}

// Функция получает список файлов с сервера
function getFilesNames() {
  $.ajax({
      url: 'get_files',
      type: 'GET',
      dataType: 'json',
      async: false,
      success: function(data) {
          writeFilesNamesToHtml(data["files"]);
      }
  });
}

// Функция генерирует html код для блока с файлами
function writeFilesNamesToHtml(files) {
  var innerHtml = "<table>";
  files.forEach(file => {
    innerHtml += "<tr>";
    innerHtml += "<td width=\"90%\">" + "<a href=\"" + document.URL + "/uploads/" + file + "\" download>" + file  + "</a>" + "</td>";
    innerHtml += "<td width=\"10%\"><button class=\"remove-file-button\" filename=" + file + " onclick=\"removeFileFromServer(this)\">X</button></td>";
    innerHtml += "</tr>";
  });
  innerHtml += "</table>";

  $("#filesDiv").html(innerHtml);
}

// Функция получает список файлов с сервера
function removeFileFromServer(button) {
  var filename = $(button).attr("filename");
  var dataJSON = {filename: filename};
  $.ajax({
      url: "delete_file",
      type: "POST",
      data: JSON.stringify(dataJSON),
      contentType: "application/json; charset=utf-8",
      async: false,
      success: function(data) {
        getFilesNames();
    }
  });
}

function clearFileInput() {
  // Очищаем временное хранилище файлов
  tmp_files = [];
  // Очищаем строку с выбранными файлами
  $("#selectedFileInput").val("");
}