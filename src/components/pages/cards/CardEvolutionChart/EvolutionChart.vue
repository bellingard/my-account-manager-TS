<script>
import { Bar } from 'vue-chartjs'
import * as _ from 'lodash'

export default {
  name: 'evolution-chart',
  extends: Bar,
  props: ['accountId', 'year'],

  data() {
    return {
      chartOptions: {
        legend: { display: false },
        title: { display: false },
        scales: {
          xAxes: [
            {
              stacked: true
            }
          ]
        }
      }
    }
  },

  computed: {
    chartData() {
      let dateForPreviousYear = new Date()
      if (this.year) {
        dateForPreviousYear = new Date(this.year, 0, 1)
      }
      const stats = this.$accounts.statsForPreviousYear(this.accountId, dateForPreviousYear)
      return {
        labels: _.chain(stats)
          .map(s => this.$format.month(s.date))
          .value(),
        datasets: [
          {
            fill: false,
            borderColor: '#ffc107',
            borderWidth: 2,
            pointRadius: 2,
            data: _.chain(stats)
              .map(s => this.$format.amount(s.total))
              .value(),
            type: 'line'
          },
          {
            backgroundColor: '#4caf50',
            data: _.chain(stats)
              .map(s => this.$format.amount(s.credits))
              .value()
          },
          {
            backgroundColor: '#f44336',
            data: _.chain(stats)
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
  }
}
</script>

<style>
</style>
