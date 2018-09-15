<script>
    import { Doughnut } from 'vue-chartjs';

    export default {
        extends: Doughnut,
        props: ['arg'],
        methods: {
            renderLineChart: function () {
                this.renderChart({
                    labels: this.arg.labels,
                    datasets: [
                        {
                            label: 'Contributors',
                            data: this.arg.values,
                            backgroundColor: ['#4b88ff', '#AA6FFF', '#AFF89A'],
                        }
                    ]
                }, {responsive: true, maintainAspectRatio: false})
            }
        },
        mounted() {
            this.renderLineChart();
        },
        watch: {
            'arg'(){
                this.renderLineChart()
            }
        },
    }
</script>