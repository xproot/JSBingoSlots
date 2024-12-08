/* @Project: JavaScript Slingo */
/* @Author:  nick99nack */
/* @Contact: spybob888 at aol dot com */
/* @Modified: 10:35 AM Saturday, September 04, 2021 */

stopReplay = false;
PlayingReplay = false;
PausedReplay = false;
ReplayFastForward = false;
savedIteration = 0;

function GameAction(type, data) {
    this.isAction = true;
    this.ActionType = type;
    this.ActionData = data;
}

var actionArray = new Array();

var boardArray = new Array();
boardArray[0] = new Array(0, 0, 0, 0, 0);
boardArray[1] = new Array(0, 0, 0, 0, 0);
boardArray[2] = new Array(0, 0, 0, 0, 0);
boardArray[3] = new Array(0, 0, 0, 0, 0);
boardArray[4] = new Array(0, 0, 0, 0, 0);

var boardIDs = new Array();
boardIDs[0] = new Array("A1", "B1", "C1", "D1", "E1");
boardIDs[1] = new Array("A2", "B2", "C2", "D2", "E2");
boardIDs[2] = new Array("A3", "B3", "C3", "D3", "E3");
boardIDs[3] = new Array("A4", "B4", "C4", "D4", "E4");
boardIDs[4] = new Array("A5", "B5", "C5", "D5", "E5");

slotArray = new Array(0, 0, 0, 0, 0);
activeJokerArray = new Array(0, 0, 0, 0, 0);
max_nums = new Array(15, 30, 45, 60, 75);
min_nums = new Array(1, 16, 31, 46, 61);
used_nums = new Array();
totals = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
slingos = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
unmatchedcols = new Array(0, 0, 0, 0, 0);


var num_devils = 0;
var max_devils = 2;
var active_devil = 0;
var csmb = 0;
var spin = 0;
var score = 0;
var isgameover = true;
var isspinactive = 0;
var domatchesexist = 0;
var slingoexists = 0;
var maxfcbonus = 13500;
var iscardfull = 0;
var freespins = 0;
var tempnum = 0;
var valid = 0;
var game_end_called = 0;
var audioactive = true;

function newBoard() {
	document.getElementById("gameover").style.display = "none";
	document.getElementById("scoredisplay").innerHTML = score;
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			valid = 0;
			while (valid == 0) {
				tempnum = generateNum(min_nums[i], max_nums[i]);
				if (!(used_nums.includes(tempnum))) {
					used_nums.push(tempnum);
					boardArray[i][j] = tempnum;
					valid = 1;

				}
			}

			document.getElementById(boardIDs[i][j]).innerHTML = boardArray[i][j];
		}

	}
    addReplayEvent("newBoard", recreateArray(boardArray));
} /* Thanks floppydisk! */

function takeSpin() {
	/* This function is too damn large */
	document.getElementById("startspinbtn").style.display = "none";
	document.getElementById("disabledspinbtn").style.display = "block";
	mPlay("spinclick_snd");
	active_devil = 0;
	if (spin < 20) {
		incrementSpin();
		for (var i = 0; i < 5; i++) {
			(function (i) {
				setTimeout(function () {
					if (valid) { // Since restart is now a thing you can do, I'll check for valid.
						/* Reset */

						activeJokerArray[i] = 0;
						/* Generate numbers */
						slotArray[i] = generateNum(min_nums[i] - 1, max_nums[i] + 4);
						/* Check for Jokers*/
						if (slotArray[i] > max_nums[i]) {
							mPlay("slot" + (i + 1) + "_snd");
							document.getElementById("S" + (i + 1)).innerHTML = "";
							document.getElementById("S" + (i + 1)).style.backgroundImage = "url('./img/jokerslot.gif')";
							activeJokerArray[i] = 1;
							addReplayEvent('newSlot', [i, 'joker']);
						} /* Devils, Cherubs, Coins, Free Spins */ else if (slotArray[i] < min_nums[i]) {
							csmb = generateNum(0, 6);
							if (csmb == 0 && num_devils < max_devils && active_devil != 1) {
								if (spin == 1) { /* We can't have a dd on the first spin - give them a coin instead */
									mPlay("slot" + (i + 1) + "_snd");
									num_devils++;
									document.getElementById("S" + (i + 1)).innerHTML = "";
									document.getElementById("S" + (i + 1)).style.backgroundImage = "url('./img/coinslot.gif')";
									score += 1000;
									flashSlotAndScore(i+1); //?
									addReplayEvent('newSlot', [i, 'coin']);
								} else {
									mPlay("slot" + (i + 1) + "_snd");
									document.getElementById("S" + (i + 1)).innerHTML = "";
									document.getElementById("S" + (i + 1)).style.backgroundImage = "url('./img/devilslot.gif')";
									num_devils++;
									active_devil++;
									score = score / 2;
									setTimeout(function () {
										addReplayEvent("showScreen", "devil");
										document.getElementById("devil").style.display = "block";
										mPlay("dd_snd");
										setTimeout(function () {
											addReplayEvent("hideScreen", "devil");
											document.getElementById("devil").style.display = "none";
											mPlay("scorereduce_snd");
											updateScoreDisplay();
										}, 2500)

									}, 1400)
									addReplayEvent('newSlot', [i, 'devil']);
								}
							} else if (csmb == 1 && num_devils < max_devils && active_devil != 1) {

								if (spin == 1) { /* We can't have a csmb on the first spin - give them a coin instead */
									mPlay("slot" + (i + 1) + "_snd");
									num_devils++;
									document.getElementById("S" + (i + 1)).innerHTML = "";
									document.getElementById("S" + (i + 1)).style.backgroundImage = "url('./img/coinslot.gif')";
									score += 1000;
									flashSlotAndScore(i+1); ///?
									addReplayEvent('newSlot', [i, 'coin']);
								} else {

									mPlay("slot" + (i + 1) + "_snd");
									num_devils++;
									active_devil++;
									document.getElementById("S" + (i + 1)).style.backgroundImage = "url('./img/devilslot.gif')";

									setTimeout(function () {
										addReplayEvent("showScreen", "devil");
										document.getElementById("devil").style.display = "block";
										mPlay("dd_snd");
										setTimeout(function () {
											addReplayEvent("hideScreen", "devil");
											addReplayEvent("showScreen", "csmb");
											document.getElementById("devil").style.display = "none";
											document.getElementById("csmb").style.display = "block";
											mPlay("csmb_snd");

											setTimeout(function () {
												addReplayEvent("hideScreen", "csmb");
												document.getElementById("csmb").style.display = "none";
											}, 3800)

										}, 2500)

									}, 1400)
									addReplayEvent('newSlot', [i, 'csmb']);
								}

							} else if (csmb > 1 && csmb < 5) {
								mPlay("slot" + (i + 1) + "_snd");
								document.getElementById("S" + (i + 1)).innerHTML = "";
								document.getElementById("S" + (i + 1)).style.backgroundImage = "url('./img/coinslot.gif')";
								score += 1000;
								flashSlotAndScore(i+1); ////?
								mPlay("coin");
								addReplayEvent('newSlot', [i, 'coin']);
							} else if (csmb > 4) {
								mPlay("slot" + (i + 1) + "_snd");
								document.getElementById("S" + (i + 1)).innerHTML = "";
								document.getElementById("S" + (i + 1)).style.backgroundImage = "url('./img/freespinslot.gif')";
								freespins += 1
								flashSlotAndFreeSpins(i+1); /////?????
								mPlay("freespin_snd");
								addReplayEvent('newSlot', [i, 'freespin']);
							} else if (num_devils >= max_devils) {
								csmb = -1;
								slotArray[i] = generateNum(min_nums[i], max_nums[i]);
								mPlay("slot" + (i + 1) + "_snd");
								document.getElementById("S" + (i + 1)).innerHTML = slotArray[i];
								addReplayEvent('newSlot', i, [slotArray[i]]);
							}


						} else {
							mPlay("slot" + (i + 1) + "_snd");
							document.getElementById("S" + (i + 1)).innerHTML = slotArray[i];
							addReplayEvent('newSlot', [i, slotArray[i]]);

						}
						/* check to see if matches exist in each column */
						for (row = 0; row < 5; row++) {
							if ((boardArray[i][row] === slotArray[i] || activeJokerArray[i] == 1) && boardArray[i][row] != 0) {
								unmatchedcols[i] = 1;
								isspinactive = 1;
							}
						}


					}
				}, 310 * i);
			})(i);



		}
		setTimeout(updateSpinStatus, 1500);
	}
	document.getElementById("progressbar").style.width = ((spin / 20) * 231);
	addReplayEvent("takeSpin", spin);
}

function incrementSpin() {
	spin++;
	document.getElementById("spindisplay").innerHTML = spin;
}

function generateNum(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function checkMatch(col, row) {
	if ((boardArray[col][row] === slotArray[col] || activeJokerArray[col] == 1) && boardArray[col][row] != 0 && !PlayingReplay) {
		mPlay("filltile_snd");
		document.getElementById(boardIDs[col][row]).style.backgroundImage = "url('./img/coveredtile.gif')";
		document.getElementById(boardIDs[col][row]).innerHTML = "";
		addReplayEvent("boardHit", [col, row]);
		if (activeJokerArray[col] == 1) {
			document.getElementById("S" + (col + 1)).style.backgroundImage = "url('./img/usedjokerslot.gif')";
		}
		boardArray[col][row] = 0;
		activeJokerArray[col] = 0;
		scoring(col, row);
		unmatchedcols[col] = 0;
		csmb = -1;
		updateSpinStatus();
	} else {
		mPlay("invalid_snd");
	}
}

function resetJokerArray() {
	for (var i = 0; i < 5; i++) {
		jokerArray[i] = 0;
	}
}


function scoring(col, row) {

	/* This function sucks shit. */
	// It really does -xproot
	score += 200;

	totals[0] = boardArray[0][0] + boardArray[0][1] + boardArray[0][2] + boardArray[0][3] + boardArray[0][4]
	totals[1] = boardArray[1][0] + boardArray[1][1] + boardArray[1][2] + boardArray[1][3] + boardArray[1][4]
	totals[2] = boardArray[2][0] + boardArray[2][1] + boardArray[2][2] + boardArray[2][3] + boardArray[2][4]
	totals[3] = boardArray[3][0] + boardArray[3][1] + boardArray[3][2] + boardArray[3][3] + boardArray[3][4]
	totals[4] = boardArray[4][0] + boardArray[4][1] + boardArray[4][2] + boardArray[4][3] + boardArray[4][4]
	totals[5] = boardArray[0][0] + boardArray[1][0] + boardArray[2][0] + boardArray[3][0] + boardArray[4][0]
	totals[6] = boardArray[0][1] + boardArray[1][1] + boardArray[2][1] + boardArray[3][1] + boardArray[4][1]
	totals[7] = boardArray[0][2] + boardArray[1][2] + boardArray[2][2] + boardArray[3][2] + boardArray[4][2]
	totals[8] = boardArray[0][3] + boardArray[1][3] + boardArray[2][3] + boardArray[3][3] + boardArray[4][3]
	totals[9] = boardArray[0][4] + boardArray[1][4] + boardArray[2][4] + boardArray[3][4] + boardArray[4][4]
	totals[10] = boardArray[0][0] + boardArray[1][1] + boardArray[2][2] + boardArray[3][3] + boardArray[4][4]
	totals[11] = boardArray[4][0] + boardArray[3][1] + boardArray[2][2] + boardArray[1][3] + boardArray[0][4]

	for (var i = 0; i < 12; i++) {
		if (totals[i] == 0 && slingos[i] == 0) {

			slingos[i] = -1;
			slingoexists = 1;
			document.getElementById("slingo" + (i + 1)).style.display = "block";

			if (i > 0 && i < 6) {
				addReplayEvent("slingo", ["vertical", i]);
			} else if (i > 5 && i < 11) {
				addReplayEvent("slingo", ["horizontal", i-5]);
			} else {
				addReplayEvent("slingo", ["diagonal", i-10]);
			}

			setTimeout(function () {
				mPlay("slingo_snd");
				score += 1000;


			}, 1400)


		}
	}
	if (slingoexists == 1) {
		setTimeout(function () {
			updateScoreDisplay()
			slingoexists = 0;
			for (var j = 1; j < 13; j++) {
				document.getElementById("slingo" + j).style.display = "none";
			}
		}, 2500)
	} else {
		updateScoreDisplay()
	}

	if (slingos[0] + slingos[1] + slingos[2] + slingos[3] + slingos[4] + slingos[5] + slingos[6] + slingos[7] + slingos[8] + slingos[9] + slingos[10] + slingos[11] == -12) {
		iscardfull = 1;
		endGame(1);
	}

}

function calcFCBonus(spinnum) {
	var difference = spinnum - 5;
	return maxfcbonus - (500 * difference)
}

function updateSpinStatus() {
	var totalunmatchedcols = 0;
	for (i = 0; i < 5; i++) {
		totalunmatchedcols = totalunmatchedcols + unmatchedcols[i];
	}

	if (totalunmatchedcols == 0) {
		if (slingoexists == 1) {
			setTimeout(function () {
				isspinactive = 0;
				if (spin < 20 && iscardfull == 0) {
					if (spin > 15 && spin < 20) {
						finalSpins();
					} else {
						startNextSpin();
					}
				} else if (spin == 20) {
					endGame(2);
				}
			}, 4000)

		} else if (csmb == 1) {
			setTimeout(function () {
				isspinactive = 0;
				if (spin < 20 && iscardfull == 0) {
					if (spin > 15 && spin < 20) {
						finalSpins();
					} else {
						startNextSpin();
					}
				} else if (spin == 20) {
					endGame(2);
				}
			}, 7800)
		} else if (csmb == 0) {
			setTimeout(function () {
				isspinactive = 0;
				if (spin < 20 && iscardfull == 0) {
					if (spin > 15 && spin < 20) {
						finalSpins();
					} else {
						startNextSpin();
					}
				} else if (spin == 20) {
					endGame(2);
				}
			}, 4000)
		} else {
			setTimeout(function () {
				isspinactive = 0;
				if (spin < 20 && iscardfull == 0) {
					if (spin > 15 && spin < 20) {
						finalSpins();
					} else {
						startNextSpin();
					}
				} else if (spin == 20) {
					endGame(2);
				}
			}, 1800)
		}

	}
}

function startGame() {
	actionArray = new Array();
	isgameover = false;
	newBoard();
	mPlay("start_snd");
	document.getElementById("startgamebtn").style.display = "none";
	document.getElementById("startspinbtn").style.display = "block";
	clearSlots();
}

function clearSlots() {
	for (i = 0; i < 5; i++) {
		document.getElementById("S" + (i + 1)).innerHTML = "";
		document.getElementById("S" + (i + 1)).style.backgroundImage = "";
	}
	addReplayEvent("clearSlot", -1);
}

function endGame(mode) {
	if (!PlayingReplay) {
		document.getElementById("progressbar").style.width = 231;
	}
	/* Full Card */
	if (mode == 1) {
		setTimeout(function () {
			game_end_called = 1;
			var bonus = calcFCBonus(spin);
			document.getElementById("startspinbtn").style.display = "none";
			document.getElementById("fullcard").style.display = "block";
			score += bonus;
			document.getElementById("bonuspntdisplay").style.display = "block";
			document.getElementById("bonuspntdisplay").innerHTML = bonus;
			updateScoreDisplay()
			mPlay("fc_snd");
			setTimeout(function () {
				mPlay("gameover_snd");
				document.getElementById("fullcard").style.display = "none";
				document.getElementById("bonuspntdisplay").style.display = "none";
				document.getElementById("gameover").style.display = "block";
				document.getElementById("startgamebtn").style.display = "block";
				gameReset();
			}, 5000)
			addReplayEvent("gameEnd", bonus);
		}, 2500)

	} else if (mode == 2 && game_end_called == 0) { /* Out of Spins or Reset*/
		document.getElementById("startspinbtn").style.display = "none";
		document.getElementById("startgamebtn").style.display = "block";
		mPlay("gameover_snd");
		document.getElementById("fullcard").style.display = "none";
		document.getElementById("gameover").style.display = "block";
		addReplayEvent("gameEnd", 0);
		gameReset();
	}
}

function gameReset() {
	for (i = 0; i < 5; i++) {
		slotArray[i] = 0;
		activeJokerArray[i] = 0;
		unmatchedcols[i] = 0;
	}
	for (j = 0; j < 12; j++) {
		totals[j] = 0;
		slingos[j] = 0;
	}

	for (col = 0; col < 5; col++) {
		for (row = 0; row < 5; row++) {
			document.getElementById(boardIDs[col][row]).style.backgroundImage = "";
			document.getElementById(boardIDs[col][row]).innerHTML = "";
		}
	}

	num_devils = 0;
	active_devil = 0;
	csmb = 0;
	spin = 0;
	score = 0;
	isgameover = true;
	isspinactive = 0;
	domatchesexist = 0;
	slingoexists = 0;
	iscardfull = 0;
	freespins = 0;
	used_nums = [];
	game_end_called = 0;
	document.getElementById("freespindisplay").innerHTML = freespins;
	document.getElementById("spindisplay").innerHTML = spin;
	document.getElementById("disabledspinbtn").style.display = "none";
	clearSlots();
}

function finalSpins() {
	if (spin == 16) {
		addReplayEvent("showScreen", "finalspins4");
		document.getElementById("finalspins4").style.display = "block";
	} else if (spin == 17) {
		addReplayEvent("showScreen", "finalspins3");
		document.getElementById("finalspins3").style.display = "block";
	} else if (spin == 18) {
		addReplayEvent("showScreen", "finalspins2");
		document.getElementById("finalspins2").style.display = "block";
	} else if (spin == 19) {
		addReplayEvent("showScreen", "finalspins1");
		document.getElementById("finalspins1").style.display = "block";
	}


	if (spin == 16 && freespins == 0) {
		setTimeout(function () {
			addReplayEvent("hideScreen", "finalspins4");
			document.getElementById("finalspins4").style.display = "none";
			setTimeout(function () {
				mPlay("scorereduce_snd");
				score -= 500;
				updateScoreDisplay(1000, 0);
				startNextSpin();

			}, 1000)

		}, 5000)
	} else if (spin == 16 && freespins > 0) {
		setTimeout(function () {
			addReplayEvent("hideScreen", "finalspins4");
			document.getElementById("finalspins4").style.display = "none";
			document.getElementById("freespinq").style.display = "block";
			document.getElementById("yesbtn").style.display = "block";
			document.getElementById("nobtn").style.display = "block";
		}, 5000)
	}
	else if (spin == 17 && freespins == 0) {
		setTimeout(function () {
			addReplayEvent("hideScreen", "finalspins3");
			document.getElementById("finalspins3").style.display = "none";
			setTimeout(function () {
				mPlay("scorereduce_snd");
				score -= 1000;
				updateScoreDisplay(1000, 0);
				startNextSpin();

			}, 1000)

		}, 5000)
	} else if (spin == 17 && freespins > 0) {
		setTimeout(function () {
			addReplayEvent("hideScreen", "finalspins3");
			document.getElementById("finalspins3").style.display = "none";
			document.getElementById("freespinq").style.display = "block";
			document.getElementById("yesbtn").style.display = "block";
			document.getElementById("nobtn").style.display = "block";
		}, 5000)
	}
	else if (spin == 18 && freespins == 0) {
		setTimeout(function () {
			addReplayEvent("hideScreen", "finalspins2");
			document.getElementById("finalspins2").style.display = "none";
			setTimeout(function () {
				mPlay("scorereduce_snd");
				score -= 1500;
				updateScoreDisplay(1000, 0);
				startNextSpin();

			}, 1000)

		}, 5000)
	} else if (spin == 18 && freespins > 0) {
		setTimeout(function () {
			addReplayEvent("hideScreen", "finalspins2");
			document.getElementById("finalspins2").style.display = "none";
			document.getElementById("freespinq").style.display = "block";
			document.getElementById("yesbtn").style.display = "block";
			document.getElementById("nobtn").style.display = "block";
		}, 5000)
	}
	else if (spin == 19 && freespins == 0) {
		setTimeout(function () {
			addReplayEvent("hideScreen", "finalspins1");
			document.getElementById("finalspins1").style.display = "none";
			setTimeout(function () {
				mPlay("scorereduce_snd");
				score -= 2000;
				updateScoreDisplay(1000, 0);
				startNextSpin();

			}, 1000)

		}, 5000)
	} else if (spin == 19 && freespins > 0) {
		setTimeout(function () {
			addReplayEvent("hideScreen", "finalspins1");
			document.getElementById("finalspins1").style.display = "none";
			document.getElementById("freespinq").style.display = "block";
			document.getElementById("yesbtn").style.display = "block";
			document.getElementById("nobtn").style.display = "block";
		}, 5000)
	}

}

function startNextSpin() {
	mPlay("start_snd");
	document.getElementById("disabledspinbtn").style.display = "none";
	document.getElementById("startspinbtn").style.display = "block";
	addReplayEvent("newSpin", spin);
	clearSlots();
}

function freeSpinAnswer(val) {
	if (val == true) {
		freespins -= 1;
		flashFreeSpins();
		startNextSpin();
		document.getElementById("freespinq").style.display = "none";
		document.getElementById("yesbtn").style.display = "none";
		document.getElementById("nobtn").style.display = "none";

	} else {
		mPlay("scorereduce_snd");
		if (spin == 16) {
			score -= 500;
		} else if (spin == 17) {
			score -= 1000;
		} else if (spin == 18) {
			score -= 1500;
		} else if (spin == 19) {
			score -= 2000;
		}
		document.getElementById("freespinq").style.display = "none";
		document.getElementById("yesbtn").style.display = "none";
		document.getElementById("nobtn").style.display = "none";
		updateScoreDisplay(1000, 0);
		startNextSpin();
	}
	addReplayEvent("fsQuestion", val);
}

function toggleVolume() {
	if (audioactive) {
		// Finds all Audio in the document and mutes it, pretty cool right?
		document.querySelectorAll("audio").forEach((audio) => audio.muted = true);
		audioactive = false;
		document.getElementById("volumebtn").setAttribute("off", "");
	} else {
		document.querySelectorAll("audio").forEach((audio) => audio.muted = false);
		audioactive = true;
		document.getElementById("volumebtn").removeAttribute("off");
	}
}

function flashSlot(slotNumber, delay = 500) {
	document.getElementById("S" + slotNumber).setAttribute("scoreoutline", "");
	setTimeout(() => { 
		document.getElementById("S" + slotNumber).removeAttribute("scoreoutline");
	}, delay);
}

// [original game] flashed the points, and slot if you got a coin.
function flashSlotAndScore(slotNumber) {
	flashSlot(slotNumber);
	updateScoreDisplay(500);
}

// [original game] flashed the free spins counter, and slot if you got a Free Spin.
function flashSlotAndFreeSpins(slotNumber) {
	flashSlot(slotNumber);
	flashFreeSpins();
}

function flashFreeSpins(delay = 1000) {
	document.getElementById("freespindisplay").innerHTML = freespins;
	document.getElementById("freespindisplay").setAttribute("scoreoutline", "");
	setTimeout(() => { 
		document.getElementById("freespindisplay").removeAttribute("scoreoutline");
	}, delay);
	addReplayEvent("fsUpdate", freespins);
}

function flashCardSlot(cardXNumber, cardYNumber, delay = 500) {
	document.getElementById(boardIDs[cardXNumber][cardYNumber]).setAttribute("scoreoutline", "");
	setTimeout(() => { 
		document.getElementById(boardIDs[cardXNumber][cardYNumber]).removeAttribute("scoreoutline");
	}, delay);
}

// [original game] flashed the free score counter for every new point you got.
function updateScoreDisplay(interval = 800, delay = 500) {
	// Usually you'd play the ding sound, then flash the score and play the coindrop sound. 
	// But nick99nack has merged both sounds together, so this will do.
	setTimeout(() => { 
		document.getElementById("scoredisplay").innerHTML = score;
		document.getElementById("scoredisplay").setAttribute("scoreoutline", "");
		setTimeout(() => { 
			document.getElementById("scoredisplay").removeAttribute("scoreoutline");
		}, interval);
	}, delay);
	addReplayEvent("scoreUpdate", score);
}

function tryRestartGame() {
	if (!isgameover) {
		endGame(2);
	} else {
		mPlay("invalid_snd");
	}
}

function toggleRules() {
	var btn = document.getElementById("rulesbtn");
	if (btn.getAttribute("depressed") == null) {
		btn.setAttribute("depressed", "");
		document.getElementById("rulesframe").style.display = "block";
	} else {
		btn.removeAttribute("depressed");
		document.getElementById("rulesframe").style.display = "none";
	}
}

function replayGame(replayStorage) {
	if (isgameover && !PlayingReplay && replayStorage.length > 0) {
		stopReplay = false;
		PlayingReplay = true;
		PausedReplay = false;
		document.getElementById("startgamebtn").style.display = "none";
		document.getElementById("startspinbtn").style.display = "none";
		document.getElementById("gameover").style.display = "none";
		document.getElementById("replayplay").setAttribute("pause", "");
		gameReset();
		setTimeout(replayGameIteration(replayStorage, 0), 1000);
		mPlay("lever");
	} else if (PlayingReplay) {
		triggerReplayPause();
		mPlay("lever");
	} else {
		mPlay("invalid_snd");
	}
}

function replayGameIteration(replayStorage, iteration, step) {
	var nextIterationTimeout = 100;
	document.getElementById("replayprogress").innerHTML = iteration + "/" + actionArray.length;
	console.log("Event " + iteration + ": (" + replayStorage[iteration].ActionType + ", " + replayStorage[iteration].ActionData + ")");
	if (replayStorage[iteration].isAction && !stopReplay) {
		switch (replayStorage[iteration].ActionType) {
			case "newBoard":
				boardArray = recreateArray(replayStorage[iteration].ActionData);
				for (var i = 0; i < 5; i++) {
					for (var j = 0; j < 5; j++) {
						document.getElementById(boardIDs[i][j]).innerHTML = boardArray[i][j];
						flashCardSlot(i, j, 100);
					}
				}
				document.getElementById("scoredisplay").innerHTML = 0;
				mPlay("start_snd");
				nextIterationTimeout = 1000;
				break;

			case "newSlot":
				if (isNaN(replayStorage[iteration].ActionData[1])) {
					document.getElementById("S" + (replayStorage[iteration].ActionData[0] + 1)).innerHTML = "";
					switch (replayStorage[iteration].ActionData[1]) {
						case "joker":
							activeJokerArray[replayStorage[iteration].ActionData[0]] = 1;
							document.getElementById("S" + (replayStorage[iteration].ActionData[0] + 1)).style.backgroundImage = "url('./img/jokerslot.gif')";
							break;

						case "devil":
							document.getElementById("S" + (replayStorage[iteration].ActionData[0] + 1)).style.backgroundImage = "url('./img/devilslot.gif')";
							break;

						case "csmb":
							document.getElementById("S" + (replayStorage[iteration].ActionData[0] + 1)).style.backgroundImage = "url('./img/devilslot.gif')";
							break;

						case "coin":
							document.getElementById("S" + (replayStorage[iteration].ActionData[0] + 1)).style.backgroundImage = "url('./img/coinslot.gif')";
							mPlay("coin");
							break;

						case "freespin":
							document.getElementById("S" + (replayStorage[iteration].ActionData[0] + 1)).style.backgroundImage = "url('./img/freespinslot.gif')";
							mPlay("freespin_snd");
							break;

						default:
							document.getElementById("S" + (replayStorage[iteration].ActionData[0] + 1)).innerHTML = replayStorage[iteration].ActionData[1];
							mPlay("invalid_snd");
							break;
					}
				} else {
					document.getElementById("S" + (replayStorage[iteration].ActionData[0] + 1)).innerHTML = replayStorage[iteration].ActionData[1];
				}
				flashSlot(replayStorage[iteration].ActionData[0] + 1, 100);
				mPlay("slot" + (replayStorage[iteration].ActionData[0] + 1) + "_snd");
				nextIterationTimeout = 300;
				break;

			case "boardHit":
				var col = replayStorage[iteration].ActionData[0];
				var row = replayStorage[iteration].ActionData[1];
				document.getElementById(boardIDs[col][row]).style.backgroundImage = "url('./img/coveredtile.gif')";
				document.getElementById(boardIDs[col][row]).innerHTML = "";
				if (activeJokerArray[col] == 1) {
					document.getElementById("S" + (col + 1)).style.backgroundImage = "url('./img/usedjokerslot.gif')";
				}
				boardArray[col][row] = 0;
				activeJokerArray[col] = 0;
				flashSlot(col+1);
				flashCardSlot(col, row, 100);
				mPlay("filltile_snd");
				nextIterationTimeout = 500;
				break;

			case "scoreUpdate":
				if (replayStorage[iteration].ActionData < score) {
					mPlay("scorereduce_snd");
				}
				score = replayStorage[iteration].ActionData;
				updateScoreDisplay();
				nextIterationTimeout = 1;
				break;

			case "clearSlot":
				if (replayStorage[iteration].ActionData > -1 && replayStorage[iteration].ActionData < 5) {
					document.getElementById("S" + (replayStorage[iteration].ActionData + 1)).innerHTML = "";
					document.getElementById("S" + (replayStorage[iteration].ActionData + 1)).style.backgroundImage = "";
				} else if (replayStorage[iteration].ActionData == -1) {
					clearSlots();
				} else {
					mPlay("invalid_snd");
					console.warn("Invalid ActionData for clearSlot found: " + replayStorage[iteration].ActionData);
				}
				nextIterationTimeout = 1;
				break;

			case "newSpin":
				spin = replayStorage[iteration].ActionData;
				document.getElementById("spindisplay").innerHTML = spin;
				mPlay("start_snd");
				nextIterationTimeout = 600;
				break;

			case "takeSpin":
				spin = replayStorage[iteration].ActionData;
				document.getElementById("spindisplay").innerHTML = spin;
				mPlay("spinclick_snd");
				nextIterationTimeout = 300;
				break;

			case "fsUpdate":
				freespins = replayStorage[iteration].ActionData;
				document.getElementById("freespindisplay").innerHTML = freespins;
				flashFreeSpins();
				nextIterationTimeout = 1;
				break;

			case "fsQuestion":
				document.getElementById("freespinq").style.display = "block";
				document.getElementById("yesbtn").style.display = "block";
				document.getElementById("nobtn").style.display = "block";
				setTimeout(function() { 
					document.getElementById("freespinq").style.display = "none"; 
					document.getElementById("yesbtn").style.display = "none";
					document.getElementById("nobtn").style.display = "none";
				}, 999);

				if (replayStorage[iteration].ActionData) {
					document.getElementById("yesbtn").setAttribute("scoreoutline", "");
					setTimeout(function() { document.getElementById("yesbtn").removeAttribute("scoreoutline"); }, 900);
				} else {
					document.getElementById("nobtn").setAttribute("scoreoutline", "");
					setTimeout(function() { document.getElementById("nobtn").removeAttribute("scoreoutline"); }, 900);
				}
				
				nextIterationTimeout = 1000;
				break;

			case "gameEnd":
				bonus = replayStorage[iteration].ActionData;

				if (replayStorage[iteration].ActionData == 0) {
					mPlay("gameover_snd");
					document.getElementById("gameover").style.display = "block";
					document.getElementById("startgamebtn").style.display = "block";
					gameReset();
				} else {
					document.getElementById("fullcard").style.display = "block";
					document.getElementById("bonuspntdisplay").style.display = "block";
					document.getElementById("bonuspntdisplay").innerHTML = bonus;
					mPlay("fc_snd");
					setTimeout(function () {
						mPlay("gameover_snd");
						document.getElementById("fullcard").style.display = "none";
						document.getElementById("bonuspntdisplay").style.display = "none";
						document.getElementById("gameover").style.display = "block";
						document.getElementById("startgamebtn").style.display = "block";
						gameReset();
					}, 5000)
				}
				break;

			case "showScreen":
				nextIterationTimeout = 3000;
				switch (replayStorage[iteration].ActionData) {
					case "devil":
						document.getElementById("devil").style.display = "block";
						mPlay("dd_snd");
						break;

					case "csmb":
						nextIterationTimeout = 1000;
						document.getElementById("csmb").style.display = "block";
						mPlay("csmb_snd");
						break;

					case "finalspins4":
						document.getElementById("finalspins4").style.display = "block";
						break;

					case "finalspins3":
						document.getElementById("finalspins3").style.display = "block";
						break;

					case "finalspins2":
						document.getElementById("finalspins2").style.display = "block";
						break;
				
					case "finalspins1":
						document.getElementById("finalspins1").style.display = "block";
						break;

					default:
						mPlay("invalid_snd");
						console.warn("Invalid ActionData for showScreen found: " + replayStorage[iteration].ActionData);
						break;
				}
				break;

			case "hideScreen":
				nextIterationTimeout = 1;
				switch (replayStorage[iteration].ActionData) {
					case "devil":
						document.getElementById("devil").style.display = "none";
						break;

					case "csmb":
						document.getElementById("csmb").style.display = "none";
						break;

					case "finalspins4":
						document.getElementById("finalspins4").style.display = "none";
						break;
	
					case "finalspins3":
						document.getElementById("finalspins3").style.display = "none";
						break;
	
					case "finalspins2":
						document.getElementById("finalspins2").style.display = "none";
						break;
					
					case "finalspins1":
						document.getElementById("finalspins1").style.display = "none";
						break;
	
					default:
						mPlay("invalid_snd");
						console.warn("Invalid ActionData for hideScreen found: " + replayStorage[iteration].ActionData);
						break;
				}
				break;

			case "slingo":
				nextIterationTimeout = 1;
				var slingoTriggered = 0;
				switch (replayStorage[iteration].ActionData[0]) {
					case "horizontal":
						slingoTriggered = replayStorage[iteration].ActionData[1]+6;
						break;
					
					case "vertical":
						slingoTriggered = replayStorage[iteration].ActionData[1]+1;
						break;

					case "diagonal":
						slingoTriggered = replayStorage[iteration].ActionData[1]+11;
						break;

					default:
						console.warn("Invalid ActionData for slingo found: " + replayStorage[iteration].ActionData);
						break;
				}
				if (slingoTriggered > 0) {
					nextIterationTimeout = 1000;
					if (
						!step &&
						iteration < replayStorage.length - 1 &&
						replayStorage[iteration + 1].ActionType == "slingo"
					) {
						nextIterationTimeout = 1;
					}
					mPlay("slingo_snd");
					document.getElementById("slingo" + slingoTriggered).style.display = "block";
					setTimeout(function() {
						document.getElementById("slingo" + slingoTriggered).style.display = "none";
					}, 1000);
				}
				break;

			default:
				mPlay("invalid_snd");
				console.warn("Unknown ActionType found: " + replayStorage[iteration].ActionType);
				break;
		}
	}
    if (ReplayFastForward && nextIterationTimeout > 50) {
		nextIterationTimeout = 50;
	}
	if (iteration < replayStorage.length - 1 && !step && !stopReplay && !PausedReplay) {
		document.getElementById("progressbar").style.width = ((iteration / replayStorage.length) * 231);
		setTimeout(function() { replayGameIteration(replayStorage, iteration+1) }, nextIterationTimeout);
	} else if (PausedReplay) {
		savedIteration = iteration;
		document.getElementById("replayplay").removeAttribute("pause");
	} else {
		document.getElementById("progressbar").style.width = 231;
		ReplayFastForward = false;
		PlayingReplay = false;
		PausedReplay = false;
		stopReplay = false;
		savedIteration = 0;
		if (document.getElementById("fullcard").style.display != "none" || document.getElementById("fullcard").style.display != "gameover") {endGame(2);}
		document.getElementById("devil").style.display = "none";
		document.getElementById("csmb").style.display = "none";
		document.getElementById("devil").style.display = "none";
		document.getElementById("finalspins4").style.display = "none";
		document.getElementById("finalspins3").style.display = "none";
		document.getElementById("finalspins2").style.display = "none";
		document.getElementById("finalspins1").style.display = "none";
		document.getElementById("replayffwd").removeAttribute("norm");
		document.getElementById("startgamebtn").style.display = "block";
		document.getElementById("replayplay").removeAttribute("pause");
		console.info("Replay finished.");
	}
}

//needed because JS will reference objects in arrays
function recreateArray(arr) {
    var copy = [];
    for (var i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
            copy[i] = recreateArray(arr[i]); // Recursively copy nested arrays
        } else if (typeof arr[i] === "object" && arr[i] !== null) {
            copy[i] = {}; // Create a new object for nested objects
            for (var key in arr[i]) {
                if (arr[i].hasOwnProperty(key)) {
                    copy[i][key] = arr[i][key]; // Copy properties
                }
            }
        } else {
            copy[i] = arr[i]; // For other values, just copy them
        }
    }
    return copy;
}

function addReplayEvent(type, data){
	if (!PlayingReplay && !isgameover) {
		actionArray.push(new GameAction(type, data));
		document.getElementById("replayprogress").innerHTML = actionArray.length;
	}
}

function triggerReplayPause() {
	if (PausedReplay) {
		PausedReplay = false;
		if (savedIteration > 0) {
			replayGameIteration(actionArray, savedIteration);
		}
		document.getElementById("replayplay").setAttribute("pause", "");
	} else {
		PausedReplay = true;
		document.getElementById("replayplay").removeAttribute("pause");
	}
}

function triggerReplayStop() {
	if (PausedReplay) {
		mPlay("click");
		PausedReplay = false;
		stopReplay = true;
		replayGameIteration(actionArray, savedIteration);
	} else if (PlayingReplay) {
		mPlay("click");
		stopReplay = true;
	} else {
		mPlay("invalid_snd");
	}
}

function DownloadReplay() {
	if (actionArray.length > 0) {
		//https://stackoverflow.com/a/18197511/
		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(actionArray)));
		pom.setAttribute('download', "slingo_replay.json");
	
		if (document.createEvent) {
			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			pom.dispatchEvent(event);
		}
		else {
			pom.click();
		}
	} else {
		mPlay("invalid_snd");
	}
}

function UploadReplay() {
	if (!PlayingReplay && isgameover) {
		document.getElementById("fileInput").click();
	} else {
		mPlay("invalid_snd");
	}
}

function ToggleReplaySpeed() {
	if (PlayingReplay) {
		ReplayFastForward = !ReplayFastForward;
		if (ReplayFastForward) {
			document.getElementById("replayffwd").setAttribute("norm", "");
		} else {
			document.getElementById("replayffwd").removeAttribute("norm");
		}
	} else {
		mPlay("invalid_snd");
	}
}
