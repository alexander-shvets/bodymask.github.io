const {log} = console
let neuralNetwork
let processing = true, canvas

async function setup(){
    status('Loading Neural Network...')
    neuralNetwork = await bodyPix.load()
    status('Neural Network loaded.')
    ([canvas] = document.getElementsByTagName('canvas'))
    return Boolean( neuralNetwork && canvas )
}

let video, camera

function draw(){
    requestAnimationFrame(draw)
    if( processing ){
        if( video && neuralNetwork ){
            drawBodyMasks()
        }
    }
}

async function startCamera(){
    status('Opening Camera...')
    camera = await navigator.mediaDevices
        .getUserMedia({video: {facingMode: "environment"}, audio: false})
        .catch(status)
    startVideo(camera)
    status('Camera started.')
}

const to = win => open(
    'output.html#' + win, win, 
    'toolbar=no, scrollbars=no, alwaysRaised, width=640, height=480'
)

function openForegroundWindow(){
    const output = to('foreground')
    log(output)
    startVideo(camera, output)
    output.head.title = 'BodyMask output Foreground'
}

function openBackgroundWindow(){
    const output = to('background')
    startVideo(camera, output)
    output.head.title = 'BodyMask output Background'
}

function startVideo(stream, output = window){
    if (output.document) setStream()
    else setTimeout(setStream)//output.onload = setStream
    function setStream(){
        [video] = output.document.getElementsByTagName('video');
        video.srcObject = stream
        video.play()
    }
}

function status (message){
    log (message)
    const uiElement = document.getElementById('status')
    uiElement.innerHTML = message
}

function drawBodyMasks(){
    const segmentation = neuralNetwork.segmentMultiPerson( video )
    log( segmentation )

    const foreground = {r: 255, g: 255, b: 255, a: 255}
    const background = {r: 0, g: 0, b: 0, a: 255}
    const contour = false
    const mask = bodyPix.toMask(
        segmentation, foreground, background, contour
    )
    
    const opacity = 0.7
    const flipHorizontal = false
    const maskBlurAmount = 0
    bodyPix.drawMask(
        canvas, video, mask,
        opacity, maskBlurAmount, flipHorizontal
    )
}






















