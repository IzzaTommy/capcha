export class TimelineState {
    constructor(initStartTime, initEndTime) {
        this.startTime = initStartTime;
        this.endTime = initEndTime;
        this.duration = this.endTime -  this.startTime;
        [this.interval, this.subInterval, this.clipLength] = this.setTimings();
    }

    update(newStartTime, newEndTime) {
        this.startTime = newStartTime;
        this.endTime = newEndTime;
        this.duration = this.endTime - this.startTime;
        [this.interval, this.subInterval, this.clipLength] = this.setTimings();
    }

    getStartTime() {
        return this.startTime;
    }

    getEndTime() {
        return this.endTime;
    }

    getDuration() {
        return this.duration;
    }

    getInterval() {
        return this.interval;
    }

    getSubInterval() {
        return this.subInterval;
    }

    getClipLength() {
        return this.clipLength;
    }

    setTimings() {
        if (this.duration > 2400) {
            return [600, 150, 120];
        } 
        else {
            if (this.duration > 960) {
                return [300, 60, 60];
            } 
            else {
                if (this.duration > 480) {
                    return [120, 30, 50];
                } 
                else {
                    if (this.duration > 240) {
                        return [60, 15, 30];
                    }
                    else {
                        if (this.duration > 80) {
                            return [30, 10, 30];
                        }
                        else {
                            if (this.duration > 40) {
                                return [10, 5, 20];
                            }
                            else {
                                return [5, 1, 5];
                            }
                        }
                    }
                }
            }
        }
    }
}