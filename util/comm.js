
/**
 * Structure for holding messages from the server
 */
class CommResponse {
    static SUCCESS = 0;
    static FAIL = 1;
    static CRASH = 2;
    static UNHANDLED = 3;

    /**
     * Create a structure for hanlding a server response
     * @param {String | CommResponse} obj - the response object, either a CommResponse or a JSON string
     */
    constructor(obj) {
        if (obj.msgs !== undefined && obj.code !== undefined) {
            this.msgs = obj.msgs;
            this.code = obj.code;
            return;
        }
        try {
            let t = JSON.parse(obj);
            if (t.fail === undefined || !t.fail) {
                if (t.msgs !== undefined && Array.isArray(t.msgs)) {
                    for (let m of t.msgs)
                        if (m.fail !== undefined && m.fail == true) {
                            console.log("server error message");
                            this.msgs = t.msgs;
                            this.code = CommResponse.FAIL
                            return;
                        }
                    console.log("successful message");
                    this.msgs = t.msgs;
                    this.code = CommResponse.SUCCESS;
                    return;
                }
            }
            else {
                if (t.msgs !== undefined) {
                    console.log("server error message");
                    this.msgs = t.msgs;
                    this.code = CommResponse.FAIL
                    return;
                }
            }
        }
        catch (e) {
            console.log("parse error message");
            this.msgs = [e];
            this.code = CommResponse.CRASH;
            return;
        }
        console.log("unknown error message");
        this.code = CommResponse.UNHANDLED;
        this.msgs = [obj];
    }
}

/**
 * Handle communication with the server
 */
class Comm {
    static stateQueryInterval = 5000;
    static processingSite = "submit.php";
    static fromUser = "";
    static _lastTransmitTime = Date.now();
    static _stateQuerytimer = null;
    static _updateCallbacksSuccess = [];

    static GetUpdates(onSuccess, toType = "") {
        if (Comm._stateQuerytimer == null)
            Comm._stateQueryWork(Comm.stateQueryInterval);
        Comm._updateCallbacksSuccess.push({ type: toType, callback: onSuccess });
    }

    static StopGettingUpdates(onSuccess) {
        let index = -1;
        for (let i = 0; i < Comm._updateCallbacksSuccess.length; ++i) {
            const c = Comm._updateCallbacksSuccess[i];
            if (onSuccess == c.callback) {
                index = i;
                break;
            }
        }
        if (index != -1)
            Comm._updateCallbacksSuccess.splice(i, 1)
    }

    static _callback(commResponse, callbacks) {
        console.log(commResponse);
        for (let m of commResponse.msgs) {
            for (const c of callbacks) {
                if (c.type == "" || m.to === undefined)
                    c.callback(m);
                else if (c.type == m.to)
                    c.callback(m);
            }
        }
    }

    static _stateQueryWork(intervalTime) {
        Comm._stateQuerytimer = setTimeout(
            () => {
                console.log("timeout function fired");
                let n = Date.now();
                let lastTransmitted = n - this._lastTransmitTime;
                if (lastTransmitted > intervalTime) {
                    this._lastTransmitTime = n;
                    Comm.Send("update").then(
                        (r) => {
                            console.log("successfully sent stateQuery message " + Comm.stateQueryInterval)
                            this._stateQueryWork(Comm.stateQueryInterval);
                            Comm._callback(r, Comm._updateCallbacksSuccess);
                        },
                        (r) => {
                            console.log("failed to send stateQuery message, delaying time " + intervalTime);
                            this._stateQueryWork(intervalTime * 2);
                        });
                }
                else {
                    console.log("stateQuery time was updated")
                    this._stateQueryWork(intervalTime - lastTransmitted);
                }
            }, intervalTime
        )
        return Comm._stateQuerytimer;
    }

    static _updatestateQueryTime() {
        Comm._lastTransmitTime = Date.now();
    }

    /**
     * Send something to the server for it to work with
     * @param {String} act - What the server should do with the data
     * @param {FormData} data - The data to send to the server
     */
    static Send(act, data = null) {
        return new Promise((success, fail) => {
            const request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        console.log("successfully communicated data " + this.statusText + " " + this.responseText);
                        const resp = new CommResponse(this.responseText);
                        Comm._updatestateQueryTime();
                        if (resp.code == CommResponse.SUCCESS)
                            success(resp);
                        else
                            fail(resp);
                    }
                    else {
                        console.log("failed to communicate data " + this.status);
                        fail(JSON.stringify({
                            msgs: [{
                                status: this.status,
                                error: "failed to get response from server"
                            }]
                        }))
                    }
                }
            };

            if (data == null) {
                request.open('GET', Comm.processingSite + "?act=" + act, true);
                request.send();
            }
            else {
                request.open('POST', Comm.processingSite + "?act=" + act, true);
                request.send(data);
            }
        });
    }
}