/**
 * @exports timelineState
 */
export { TimelineState };

/**
 * Class for representing the timeline
 * 
 * @class TimelineState
 */
class TimelineState {
    /**
     * Updates all internal variables based on the new start time and new end time
     * 
     * @param {number} newStartTime - The new start time
     * @param {number} newEndTime - The new end time
     */
    update(newStartTime, newEndTime) {
        this.startTime = newStartTime;
        this.endTime = newEndTime;
        this.duration = this.endTime - this.startTime;
        [this.interval, this.subInterval, this.clipLength] = this.setTimings();
    }

    /**
     * Gets the start time
     * 
     * @returns {number} The start time
     */
    getStartTime() {
        return this.startTime;
    }

    /**
     * Gets the end time
     * 
     * @returns {number} The end time
     */
    getEndTime() {
        return this.endTime;
    }

    /**
     * Gets the duration
     * 
     * @returns {number} The duration
     */
    getDuration() {
        return this.duration;
    }

    /**
     * Gets the interval
     * 
     * @returns {number} The interval
     */
    getInterval() {
        return this.interval;
    }

    /**
     * Gets the subinterval
     * 
     * @returns {number} The subinterval
     */
    getSubInterval() {
        return this.subInterval;
    }

    /**
     * Gets the clip length
     * 
     * @returns {number} The clip length
     */
    getClipLength() {
        return this.clipLength;
    }

    /**
     * Sets the interval, subinterval, and clip length based on the duration (in seconds)
     * 
     * @returns {number[]} The interval, subinterval, and clip length
     */
    setTimings() {
        if (this.duration > 7200) {
            return [3600, 900, 300];
        }
        else {
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
}