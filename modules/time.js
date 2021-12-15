
 /**
  * Returns a string representation of a duration
  * @param {Integer} duration - Duration in milliseconds
  * @returns {String}
  */
  function msToTime(duration) {
    var milliseconds = Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + "h" + minutes + "m" + seconds + "s";
}

function convertTZ(date, tzString) {
  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));
}

function getDbString(date){
  return date.toISOString().split('T')[0] + " " + date.toTimeString().split(' ')[0]
}

function getParisTime(){
  return convertTZ(new Date(), 'Europe/Paris')
}

module.exports = {
  getDbString,
  msToTime,
  convertTZ,
  getParisTime
}