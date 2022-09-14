<template>
  <div class="live-attendance">
    <vs-chip transparent :color="color">
      <span :class="nextAction != '' ? 'mr-2' : ''">
        {{ label }}
      </span>
      <vs-button
        v-if="nextAction != ''"
        :color="color"
        size="small"
        type="filled"
        @click="onLiveAttendanceConfirm"
        >{{ nextAction === 'clockin' ? 'Clock In' : 'Clock Out' }}</vs-button
      >
    </vs-chip>
  </div>
</template>
<script>
// 1 today you are not clockin yet - not checkin
// 2 today you are clockin - checkin before 6pm
// 3 today you are not clockout yet - checking after 6pm
// 4 today you are finished
import { getHistory, postLiveAttendance } from '../utils/api.js';

export default {
  name: 'LiveAttendance',
  data() {
    return {
      label: 'getting data ...',
      color: 'warning',
      nextAction: '',
    };
  },
  async created() {
    this.init();
  },
  methods: {
    async init() {
      try {
        const history = await getHistory();
        this.checkClockIn(history);
      } catch (e) {
        console.log(e);
      }
    },
    checkClockIn(history) {
      if (history.length) {
        const clockInData = history.find((h) => h.check_type === 1);
        const clockOutData = history.find((h) => h.check_type !== 1);
        if (clockOutData) {
          this.label = 'Today you are finished';
          this.color = 'success';
          this.nextAction = '';
        } else if (clockInData) {
          // check today before 6pm
          const now = new Date();
          if (now.getHours() < 18) {
            this.label = 'Happy working hours';
            this.color = 'success';
            this.nextAction = 'clockout';
          } else {
            this.label = "You're over time not over paid";
            this.color = 'danger';
            this.nextAction = 'clockout';
          }
        }
      } else {
        const now = new Date();
        // exception before hours
        // exception saturdary & sunday
        if (now.getHours() < 8) {
          this.label = 'Your time is not coming yet';
          this.color = 'warning';
          this.nextAction = '';
        } else if (now.getDay() === 0 || now.getDay() === 6) {
          this.label = 'No work on weekends';
          this.color = 'warning';
          this.nextAction = '';
        } else {
          this.label = 'Please click this button';
          this.color = 'danger';
          this.nextAction = 'clockin';
        }
      }
    },
    onLiveAttendanceConfirm() {
      this.$vs.dialog({
        color: 'warning',
        title: `Confirm Live Attendance`,
        text: `Are you sure ?`,
        accept: () => this.onLiveAttendance(),
      });
    },
    async onLiveAttendance() {
      if (this.nextAction === '') return;
      try {
        if (this.nextAction === 'clockin') {
          await postLiveAttendance('checkin');
        } else if (this.nextAction === 'clockout') {
          await postLiveAttendance('checkout');
        }
        this.init();
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>
<style scoped>
.live-attendance {
  color: #ffffff;
}
</style>
