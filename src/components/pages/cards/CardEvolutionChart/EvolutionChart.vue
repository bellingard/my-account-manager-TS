<script>
import { Bar } from 'vue-chartjs'
import * as _ from 'lodash'

export default {
  name: 'evolution-chart',
  extends: Bar,
  props: ['accountId', 'year'],

  data() {
    return {
      stats: this.$stats.statsForPreviousYear([this.accountId], new Date(), false),
      chartOptions: {
        legend: { display: false },
        title: { display: false },
        scales: {
          xAxes: [
            {
              stacked: true
            }
          ]
        },
        onClick: this.clicked
      }
    }
  },

  computed: {
    chartData() {
      let dateForPreviousYear = new Date()
      if (this.year) {
        dateForPreviousYear = new Date(this.year + 1, 0, 1)
      }
      // eslint-disable-next-line
      this.stats = this.$stats.statsForPreviousYear([this.accountId], dateForPreviousYear, false)
      return {
        labels: _.chain(this.stats)
          .map(s => this.$format.month(s.date))
          .value(),
        datasets: [
          {
            fill: false,
            borderColor: '#ffc107',
            borderWidth: 2,
            pointRadius: 2,
            data: _.chain(this.stats)
              .map(s => this.$format.amount(s.total))
              .value(),
            type: 'line'
          },
          {
            backgroundColor: '#4caf50',
            data: _.chain(this.stats)
              .map(s => this.$format.amount(s.credits))
              .value()
          },
          {
            backgroundColor: '#f44336',
            data: _.chain(this.stats)
              .map(s => this.$format.amount(s.debits))
              .value()
          }
        ]
      }
    }
  },

  mounted() {
    this.renderChart(this.chartData, this.chartOptions)
  },

  watch: {
    accountId: function(newAccountId) {
      this.renderChart(this.chartData, this.chartOptions)
    },
    year: function(newAccountId) {
      this.renderChart(this.chartData, this.chartOptions)
    }
  },

  methods: {
    clicked(event, activeElements) {
      if (activeElements[0]) {
        const itemIndex = activeElements[0]._index
        this.$emit('monthSelected', this.stats[itemIndex].date.substring(0, 7))
      }
    }
  }
}
</script>
