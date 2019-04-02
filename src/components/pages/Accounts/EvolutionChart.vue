<script>
import { Bar } from 'vue-chartjs'
import * as _ from 'lodash'

export default {
  name: 'evolution-chart',
  extends: Bar,
  props: ['transactions'],
  methods: {
    stats(year) {
      return _.chain(this.transactions)
        .filter(t => this.$format.year(t.date) === year)
        .sortBy(t => t.date)
        .groupBy(t => this.$format.month(t.date))
        .map(this.computeStats)
        .sortBy(s => s.order)
        .value()
    },
    computeStats(group) {
      let stat = {
        order: group[0].date.substring(5, 7),
        month: this.$format.month(group[0].date),
        total: 0,
        debits: 0,
        credits: 0
      }
      group.forEach(t => {
        if (t.fromId === 'A120' || t.fromId === 'A159' || this.$repo.isTransfer(t)) {
          // Let's not count the "other expenses or revenues" nor bank transfers
          return
        }

        stat.total += t.amount
        if (t.amount > 0) {
          stat.credits += t.amount
        } else {
          stat.debits += t.amount
        }
      })
      return stat
    }
  },
  mounted() {
    let stats = this.stats(new Date().getFullYear().toString())
    this.renderChart(
      {
        labels: _.chain(stats)
          .map(s => s.month)
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
      },
      {
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
    )
  }
}
</script>

<style>
</style>
