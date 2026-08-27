var time = Date.now();
var playMarioStarted = false;
var playMarioAttempts = 0;

function startPlayMario() {
    if (playMarioStarted) {
        return;
    }

    // The engine sizes itself from the viewport at boot; if the page loaded in a
    // hidden/zero-sized tab, wait until real dimensions are available.
    if ((!document.body || document.body.clientWidth === 0 || window.innerHeight === 0) && playMarioAttempts < 120) {
        playMarioAttempts += 1;
        setTimeout(startPlayMario, 250);
        return;
    }

    try {
        var UserWrapper = new UserWrappr.UserWrappr(PlayMarioJas.PlayMarioJas.prototype.proliferate(
            {
                "GameStartrConstructor": PlayMarioJas.PlayMarioJas
            }, PlayMarioJas.PlayMarioJas.settings.ui, true));

        playMarioStarted = true;
        console.log("PlayMario took " + (Date.now() - time) + " milliseconds to start.");
        UserWrapper.GameStarter.UsageHelper.displayHelpMenu();
    } catch (error) {
        playMarioAttempts += 1;
        if (playMarioAttempts < 120) {
            console.warn("PlayMario failed to start; retrying...", error);
            setTimeout(startPlayMario, 500);
        } else {
            throw error;
        }
    }
}

document.onreadystatechange = function (event) {
    if (event.target.readyState !== "complete") {
        return;
    }
    startPlayMario();
};

if (document.readyState === "complete") {
    startPlayMario();
}
