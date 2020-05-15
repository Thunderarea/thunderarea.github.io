$(document).ready(() => {
  var speed = 100;
  var flag = true;
  var i = 0;
  var text = 'THUNDERAREA';
  var container = $('#site_name');

  typeWriter();

  function typeWriter() {
    console.log(i);
    if (i < text.length) {
      container.text(container.text() + "" + text.charAt(i));
      i++;
      setTimeout(typeWriter, speed);
    } else if(flag) {
      flag = false;
      i = 0;
      text = 'coming soon';
      container = $('#site_description');
      setTimeout(typeWriter, speed);
    }
  }

});
