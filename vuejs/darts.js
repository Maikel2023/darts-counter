Vue.component('countdown-timer', {
    data() {
        return {
            totalTime: 100 * 60 * 60, // Total time in seconds (100 hours)
            currentTime: 100 * 60 * 60, // Current time in seconds (initialized with total time)
            timer: null,
            isAdmin: true,
            scores: [],
            scoreInput: null,
            totalScore: 0, // New property to store the total score
            status: "stopped",
            message: "",
            test: "",
            timeLeft: "",
        };
    },
    computed: {
        formatTime() {
            const hours = Math.floor(this.currentTime / 3600);
            const minutes = Math.floor((this.currentTime % 3600) / 60);
            const seconds = this.currentTime % 60;

            return `${this.padTime(hours)}:${this.padTime(minutes)}:${this.padTime(seconds)}`;
        },
        averageScore() {
            if (this.scores.length === 0) {
                return 0;
            }
            return (this.totalScore / this.scores.length).toFixed(2);
        },
    },
    methods: {
        startTimer() {
            clearInterval(this.timer);
            this.timer = setInterval(() => {
                if (this.currentTime > 0 && this.status == "running") {
                    this.currentTime--;
                } else {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            }, 1000);
        },
        toggleTimer() {
            // this.isPaused = !this.isPaused;
            // if (this.isPaused) {
            //     clearInterval(this.timer);
            //     this.timer = null;
            // } else {
            //     this.startTimer();
            // }

            // if (this.status == "stopped") {
            //     this.action = "start";
            // } else {
            //     this.action = "end";
            // }

            $.ajax({
                type: "POST",
                url: "timer.php",
                data: {
                    ajax: "1",
                    data: JSON.stringify({ action: (this.status == "stopped" ? "start" : "end") })
                },
                dataType: 'json',
                context: this
            }).done(function (response) {
                if (response.status != undefined) {
                    this.status = response.status;
                    if (this.status == "running") {
                        this.startTimer();
                    }
                }
                if (response.timeLeft != undefined) {
                    this.currentTime = response.timeLeft;
                }
                if (response.message != undefined) {
                    this.message = response.message;
                }
            }).fail(function () {
                alert('error1');
            });
        },
        resetTimer() {
            $.ajax({
                type: "POST",
                url: "timer.php",
                data: {
                    ajax: "1",
                    reset: "1",
                },
                dataType: 'json',
                context: this
            }).done(function (response) {
                if (response.timeLeft != undefined) {
                    this.currentTime = response.timeLeft;
                }
                if (response.status != undefined) {
                    this.status = response.status;
                }
            }).fail(function () {
                alert('error2');
            });

        },
        loadTimer() {
            $.ajax({
                type: "POST",
                url: "timer.php",
                data: {
                    ajax: "1",
                    loadTimer: "1"
                },
                dataType: 'json',
                context: this
            }).done(function (response) {
                if (response.timeLeft != undefined) {
                    this.currentTime = response.timeLeft;
                }
                if (response.status != undefined) {
                    this.status = response.status;
                }
                if (this.status == "running") {
                    this.startTimer();
                }
            }).fail(function () {
                alert('error');
            });
        },
        padTime(time) {
            return time.toString().padStart(2, '0');
        },
        addScore() {
            if (this.scoreInput === null) {
                alert('Please enter a score.');
                return;
            }

            const score = parseFloat(this.scoreInput);
            if (isNaN(score) || !Number.isInteger(score)) {
                alert('Please enter an integer score.');
                return;
            }
            this.scores.push(score);
            this.totalScore += score;
            // Reset the score input
            this.scoreInput = null;

            $.ajax({
                type: "POST",
                url: "gameData.php",
                data: {
                    ajax: "1",
                    data: JSON.stringify({ totalScore: this.totalScore, averageScore: this.averageScore, scoreArray: this.scores })
                },
                dataType: 'json',
                context: this
            }).done(function (response) {
                if (response.score != undefined) {
                    this.totalScore = JSON.parse(response.score);
                }
                if (response.averageScore != undefined) {
                    this.averageScore = JSON.parse(response.averageScore);
                }
                if (response.scoreArray != undefined) {
                    this.scores = JSON.parse(response.scoreArray);
                }
            }).fail(function () {
                alert('error');
            });
        },
        loadScore() {
            $.ajax({
                type: "POST",
                url: "gameData.php",
                data: {
                    ajax: "1",
                    loadScore: "1",
                },
                dataType: 'json',
                context: this
            }).done(function (response) {
                if (response.score != undefined) {
                    this.totalScore = JSON.parse(response.score);
                }
                if (response.averageScore != undefined) {
                    this.averageScore = JSON.parse(response.averageScore);
                }
                if (response.scoreArray != undefined) {
                    this.scores = JSON.parse(response.scoreArray);
                }
            }).fail(function () {
            });
        },
        removeScore(index) {
            this.totalScore -= this.scores[index];
            this.scores.splice(index, 1);

            $.ajax({
                type: "POST",
                url: "gameData.php",
                data: {
                    ajax: "1",
                    data: JSON.stringify({ totalScore: this.totalScore, averageScore: this.averageScore, scoreArray: this.scores })
                },
                dataType: 'json',
                context: this
            }).done(function (response) {
                if (response.score != undefined) {
                    this.totalScore = JSON.parse(response.score);
                }
                if (response.averageScore != undefined) {
                    this.averageScore = JSON.parse(response.averageScore);
                }
                if (response.scoreArray != undefined) {
                    this.scores = JSON.parse(response.scoreArray);
                }
            }).fail(function () {
                alert('error');
            });
        },
    },
    mounted() {
        this.loadTimer();
        this.loadScore();
    },
    template: `
      <div>
        <p class="h1">{{ formatTime }}</p>
        <button v-if="isAdmin" class="btn btn-primary" @click="toggleTimer">{{ status == "stopped" ? 'Resume' : 'Pause' }}</button>
        <button v-if="isAdmin" class="btn btn-primary" @click="resetTimer">Reset timer</button>
        <div>
          <input v-if="isAdmin" type="number" v-model="scoreInput" placeholder="Enter score" @keyup.enter="addScore">
          <button v-if="isAdmin" @click="addScore">Add Score</button>
        </div>
        <div>
          <p>Total Score: {{ totalScore }}</p>
          <p>Average Score: {{ averageScore }}</p>
          <div v-for="(score, index) in scores" :key="index">
            <span>{{ score }}</span>
            <button v-if="isAdmin" @click="removeScore(index)">Remove</button>
          </div>
        </div>
      </div>
    `,
});

new Vue({
    el: '#app',
});
