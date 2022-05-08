const video = document.querySelector("video");
const vid = document.querySelector("#video_stream");
const vid_msg = vid.querySelector(".msg");
const playE = document.querySelector("#play");
const pauseE = document.querySelector("#pause");
const stopE = document.querySelector("#stop");
const timelineE = document.querySelector("#timeline");
const previewE = document.querySelector("#preview");
const downloadE = document.querySelector("#download");
const backE = document.querySelector("#back");
const nav = document.querySelector("nav");
previewE.style.display = "none";
downloadE.style.display = "none";
backE.style.display = "none";
video.muted = true;
video.controls = false;
if (navigator?.mediaDevices?.getDisplayMedia) {
    start();
} else {
    let a = document.createElement("a");
    a.innerHTML = `browser not supported`;
}
function start() {
    let mr = null;
    let stream = null;
    let a = document.createElement("a");
    a.innerHTML = `no scrren selected. Please select screen to view.`;
    vid_msg.innerHTML = "";
    vid_msg.append(a);
    vid.onclick = async () => {
        stream = await startcCap({ video: {
            cursor:"never"
        }, audio: true });
        if (stream) {
            video.srcObject = stream;
            video.play();
            vid_msg.style.display = "none";
            vid_msg.innerHTML = "";
            vid.onclick = null;
            nav.classList.remove("disable");
        }

    }
    async function startcCap(constraints = null) {
        const stream = await navigator.mediaDevices.getDisplayMedia(constraints).catch((res) => {
            console.error(res);
        });
        if (stream) {
            console.log("stream capture started successfully!");
        }
            dis(pauseE);
            dis(stopE);
            ene(playE);
            if(Notification.permission == "default"){
                const notification = 
                document.querySelector(".notification-alt");
                notification.classList.add("show");
                notification.onclick = ()=>{
                    Notification.requestPermission();
                    notification.classList.remove("show");
                }
                setTimeout(()=>{
                    document.querySelector(".notification-alt").classList.remove("show");
                },20000)
                
                
            }
            
        return stream;
    }


    playE.onclick = () => {
        if (mr?.state == "paused") {
            mr.resume();
        } else {
            mr = rec_start(stream);
        }
    }
    pauseE.onclick = () => {
        mr.pause();
    }
    stopE.onclick = () => {
        mr.stop();
    }

    let videoTape = [];
    window.len = { h: 0, m: 0, s: 1 };
    function rec_start(stream) {
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = ev => {
            if (ev.data.size > 0) {
                videoTape.push(ev.data);
            }
        }
        mr.onpause = () => {
            playE.classList.remove("active");
            stopE.classList.remove("active");
            pauseE.classList.add("active");
            dis(pauseE);
            ene(stopE);
            ene(playE);
            clearInterval(i);
            console.warn("recording paused!");
        }
        mr.onresume = () => {
            i = setInterval(t, 1000)
            pauseE.classList.remove("active");
            stopE.classList.remove("active");
            playE.classList.add("active");
            dis(playE);
            ene(stopE);
            ene(pauseE);
            console.log("recording resume!");
        }
        mr.onstart = () => {
            dnotif(true);
            i = setInterval(t, 1000);
            console.log("recording started!");
            pauseE.classList.remove("active");
            stopE.classList.remove("active");
            playE.classList.add("active");
            dis(playE);
            ene(stopE);
            ene(pauseE);
        }
        mr.onstop = () => {
            clearInterval(i);
            rec_stop();
            dnotif(false);
            console.log("recording stoped");
            pauseE.classList.remove("active");
            playE.classList.remove("active");
            stopE.classList.add("active");
            dis(playE);
            dis(pauseE);
            dis(stopE);
        }
        mr.start(200);
        return mr;
    }
    let i;
    function t() {
        if (window.len) {
            if (window.len.s >= 60) {
                window.len.m++;
                window.len.s = 0;
            }
            if (window.len.m >= 60) {
                window.len.h++;
                window.len.m = 0;
                window.len.s = 0;
            }
            window.len.s++;

        } else {
            window.len = { h: 0, m: 0, s: 1 }
        }
        timelineE.innerHTML = `${window.len.h}:${window.len.m}:${window.len.s}`;
    }
    function rec_stop() {
        window.len = { h: 0, m: 0, s: 0 };
        const properVideoTape = new Blob(videoTape);
        const video_URL = URL.createObjectURL(properVideoTape);
        console.log("video created successfully!");
        console.log(`video URL: ${video_URL}`);
        previewE.style.display = "block";
        backE.style.display = "block";
        previewE.onclick = () => {
            video.src = video_URL;
            video.srcObject = null;
            video.controls = true;
            downloadE.style.display = "block";
            downloadE.onclick = () => {
                let filename;
                while (true) {
                    filename = prompt("enter file name");
                    if (filename) {
                        break;
                    }
                }
                const a = document.createElement('a');
                a.setAttribute("download", `${filename}.webm`);
                a.setAttribute("href", video_URL);
                a.click();
                if (confirm("downloaded successfully?? click yes to clear video from device memory!!")) {
                    URL.revokeObjectURL(video_URL);
                    console.warn("video cleared from&nbsp;<b>Memory</b>.");
                    videoTape = [];
                    delete properVideoTape;
                }

            }
            previewE.style.display = "none";
            previewE.onclick = null;
        }
        backE.onclick = () => {
            video.src = "";
            video.srcObject = stream;
            video.controls = false;
            video.play();
            window.len = { h: 0, m: 0, s: 0 };
            previewE.style.display = "none";
            downloadE.style.display = "none";
            backE.style.display = "none";
            URL.revokeObjectURL(video_URL);
            console.warn("video cleared from&nbsp;<b>Memory</b>.");
            videoTape = [];
            delete properVideoTape;
            dis(pauseE);
            dis(stopE);
            ene(playE);
        }
    }

    const notify = document.querySelector(".notify");
    function noti(str, type) {
        const notification = document.createElement("div");
        if (type == "error") {
            notification.innerHTML = `<i class="bi-x-circle"></i> ${str}`;
        } else if (type == "warn") {
            notification.innerHTML = `<i class="bi-exclamation-circle"></i> ${str}`;
        } else if (type == "log") {
            notification.innerHTML = `<i class="bi-check-circle"></i> ${str}`;
        } else {
            notification.innerHTML = `${str}`;
        }
        notification.classList.add(type, "adding");
        notify.append(notification);
        setTimeout(() => {
            notification.classList.remove("adding");
        }, 500);
        setTimeout(() => {
            setTimeout(() => {
                notification.remove();
            }, 500);
            notification.classList.add("removing");
        }, 10000);

    }
    console.log = (str) => {
        noti(str, "log");
    }
    console.warn = (str) => {
        noti(str, "warn");
    }
    console.error = (str) => {
        noti(str, "error");
    }
    let intervalno;
    let notif;
    function dnotif(val = true) {

        if (!val) {
            clearInterval(intervalno);
            notif.close();
        } else {
            intervalno = setInterval(() => {
                notif = new Notification(`${mr.state}: ${window.len?.h || "-"}:${window.len?.m || "-"}:${window.len?.s || "-"}`, {
                    body: "click to pause/resume. close to hide",
                    icon: "favicon.png",
                    renotify: true,
                    tag: "rec_info",
                    requireInteraction: true
                });
                notif.onclick = () => {
                    if (mr?.state == "paused") {
                        mr.resume();
                    } else if (mr?.state == "recording") {
                        mr.pause();
                    }
                }

            }, 1000);
        }

    }

    function dis(ele) {
        ele.rec = ele.rec ?? {};
        ele.rec.click = ele.onclick ?? ele.rec.click;
        ele.onclick = null;
        ele.classList.add("dis");
    }


    function ene(ele) {
        if (ele?.rec?.click) {
            ele.onclick = ele.rec.click;
        }
        ele.classList.remove("dis");
    }




}
