let neuralNetwork
let processing = true, canvas
const {log, warn, error} = console

async function setup(){
    status('Loading Neural Network...')
    neuralNetwork = await bodyPix.load()
    status('Neural Network loaded.')
    ;[canvas] = document.getElementsByTagName('canvas');
    detectProjectors()
    const ok = Boolean(neuralNetwork && canvas)
    log('setup()', ok)
    document.querySelector('button').focus()
    return ok
}

async function detectProjectors(){
    if('getScreens' in window){
        const {screens} = await window.getScreens().catch(status)
        const externals = screens.filter( ({isInternal}) => 
            isInternal === false 
        )
        const {length} = externals
        status(`Found ${length} Projector(s).`, '')
    }else{
        // status(`Can't antomatically find Projectors. 
        //         __Drag output windows manually.__`)
    }
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
        .catch(status);
    if( camera ){
        startVideo(camera)
        status('Camera started.')
        return true
    }else{
        return false
    }
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
    return Boolean(output)
}

function openBackgroundWindow(){
    const output = to('background')
    startVideo(camera, output)
    output.head.title = 'BodyMask output Background'
    return Boolean(output)
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

function status(message, style='log'){
    if(message instanceof Error){
        error(message)
        style = 'error'
        message = message.message
    } else log(message)
    const statusTag = document.getElementById('status')
    statusTag.className = style
    statusTag.innerHTML = message//('message' in message ? message.message : message)
        .replaceAll("\n",       "<br/>")
        .replaceAll(/__(.+)__/g, "<b>$1</b>")
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