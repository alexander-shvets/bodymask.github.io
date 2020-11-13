const {log} = console
let neuralNetwork
let processing = true

async function setup(){
    status('Loading Neural Network...')
    neuralNetwork = await bodyPix.load()
    status('Neural Network loaded.')
    return neuralNetwork
}

let videoCamera

function driver(){
    requestAnimationFrame(driver)
    if( processing ){
        if( neuralNetwork && videoCamera ){
            processSegments()
        }
    }
}

let camera

async function startCamera(){
    status('Opening Camera...')
    camera = await navigator.mediaDevices
        .getUserMedia({video: {facingMode: "environment"}, audio: false})
        .catch(status)
    playVideo(camera)
    status('Camera started.')
}

function playVideo(stream, output = window){
    if (output.document) setStream()
    else setTimeout(setStream)//output.onload = setStream
    function setStream(){
        [videoCamera] = output.document.getElementsByTagName('video');
        videoCamera.srcObject = stream
        videoCamera.play()
    }
}

function processSegments(){
    const segmentation = neuralNetwork.segmentMultiPerson( videoCamera )

    const foregroundColor = {r: 255, g: 255, b: 255, a: 255}
    const backgroundColor = {r: 0, g: 0, b: 0, a: 255}
    const drawContour = false
    const mask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor, drawContour)
    //...
}

const openWindow = windowName => window.open(
    './output.html#'+windowName, windowName, 
    'toolbar=no, scrollbars=no, alwaysRaised, width=320, height=240'
)

function openForegroundWindow(){
    const output = openWindow('foreground')
    log(output)
    playVideo(camera, output)
    output.head.title = 'BodyMask output Foreground'
}

function openBackgroundWindow(){
    const output = openWindow('background')
    playVideo(camera, output)
    output.head.title = 'BodyMask output Background'
}

function status(message){
    log(message)
    const uiElement = document.getElementById('status')
    uiElement.innerHTML = message
}