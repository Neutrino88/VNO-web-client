<script>
    import { Line } from 'vue-chartjs';

    export default {
        extends: Line,
        props: ['arg'],
        methods: {
            renderLineChart: function () {
                this.gradient = this.$refs.canvas.getContext('2d').createLinearGradient(0, 0, 0, 450)

                this.gradient.addColorStop(0, 'rgba(255, 0,0, 0.5)')
                this.gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
                this.gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

                this.renderChart({
                    labels: this.arg.labels,
                    datasets: [
                        {
                            label: 'Commits count',
                            borderColor: '#FC2525',
                            pointBackgroundColor: '#ff5555',
                            borderWidth: 1,
                            backgroundColor: this.gradient,
                            data: this.arg.values
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