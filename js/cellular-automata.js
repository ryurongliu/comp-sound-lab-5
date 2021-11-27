
var audioCtx;
var osc;
var gainNode;


const genButton = document.getElementById("generate");
const playButton = document.getElementById("play");

//sequence to add to
//encoding notes as { pitch: 60, startTime: 0.0, endTime: 0.5 }  
sequence = [{ pitch: 60, startTime: 0.0, endTime: 0.5 },
    { pitch: 60, startTime: 0.5, endTime: 1.0 }];

var startT;
var endT; 


//clicking generate button, generate sequence
genButton.addEventListener('click', function () {

    startT = 0;
    endT = 0.5;
    sequence = [];
    //get pitch set class as list
    var input = document.getElementById('code').value;
    if (input == "") {
        document.getElementById("display").innerHTML = "PLEASE INPUT A PITCH SET CLASS";
        return;
    }
    var pitchSetClass = input.split(" ").map(Number); 

    //pick how many maps and operations to do
    //1-5 maps
    //2-8 operations per map 
    var numMaps = Math.floor(Math.random() * 5) + 1; 
    var opsPerMap = [];
    for (var i = 0; i < numMaps; i++) {
        opsPerMap.push(Math.floor(Math.random() * 7) + 2); 
    }

    //do operations for each map 
    for (var i = 0; i < numMaps; i++) {
        //roughly within "nice" frequencies 
        var offset = Math.floor(Math.random() * 30) + 50;
        for (var j = 0; j < opsPerMap[i]; j++) {
            //do a random operation 
            operated = randomOp(pitchSetClass, offset);
            //add notes to sequence
            addNotes(operated, offset);
        }
    }
    var output = "";
    for (var i = 0; i < sequence.length; i++) {
        output += sequence[i].pitch.toString() + " ";
    }
    document.getElementById("display").innerHTML = output;

});

//clicking play button, play notes 
playButton.addEventListener('click', function () {

    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    osc = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    osc.connect(gainNode).connect(audioCtx.destination);
    osc.start();
    gainNode.gain.value = 0;

    playNotes(sequence);


});


//do a random operation
function randomOp(PSC, off){

    //number of transposes to do (at least 1)
    var transposes = Math.floor(Math.random() * 11) + 1;
    //inversion or not
    var invert = Math.floor(Math.random() * 2);
    //retrograde or not
    var retro = Math.floor(Math.random() * 2);

    //perform operations
    PSC = transpose(PSC, transposes);
    console.log("transposed by " + transposes.toString() + PSC.toString());
    if (invert) {
        PSC = inversion(PSC);
        console.log("inverted " + PSC.toString());
    };
   
    if (retro) {
        PSC = retrograde(PSC);
        console.log("retrograded " + PSC.toString());
    };
    


    mappedPSC = [];
    for (var i = 0; i < PSC.length; i++) {
        mappedPSC.push(PSC[i] + off);
    }
    console.log("mapped to " + off.toString() + " " + mappedPSC.toString());

    return mappedPSC; 
}




//*******OPERATIONS

//transpose
function transpose(noteList, num) {
    console.log("transposing");
    var transposed = [];
    for (var i = 0; i < noteList.length; i++) {
        transposed.push((noteList[i] + num)%12); 
    }
    return transposed;
}

//inversion
function inversion(noteList) {
    console.log("inverting");
    var inverted = [];
    for (var i = 0; i < noteList.length; i++) {
        inverted.push((12 - noteList[i]) % 12);
    }
    return inverted;
}

//retrograde
function retrograde(noteList) {
    console.log("retrograding");

    return noteList.reverse(); 
}




//add notes to sequence
function addNotes(noteList, off){
    console.log("adding notes");
    for (var i = 0; i < noteList.length; i++) {
        sequence.push({
            pitch: noteList[i],
            startTime: startT,
            endTime: startT + (noteList[i] + 1 - off) * 0.05
        });
        startT += (noteList[i]+1-off) * 0.05; 
    }
}


//convert to freq
function midiToFreq(m) {
    return Math.pow(2, (m - 69) / 12) * 440;
}

//play sequence
function playNotes(noteList) {
    console.log(noteList)
    noteList.forEach(note => {
        playNote(note);
    });
}

//play each note
function playNote(note) {
    offset = 1 //it takes a bit of time to queue all these events
    gainNode.gain.setTargetAtTime(0.7, note.startTime + offset, 0.01)
    osc.frequency.setTargetAtTime(midiToFreq(note.pitch),
        note.startTime + offset, 0.001)
    gainNode.gain.setTargetAtTime(0, note.endTime + offset - 0.05, 0.01)

}