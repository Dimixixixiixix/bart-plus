<script>
  let { ramUsed = 0, ramTotal = 524288 } = $props();
  let used = $derived(ramUsed);
  let total = $derived(ramTotal);
  let percent = $derived(Math.min(100, Math.round((used / total) * 100)));
  let color = $derived(percent > 90 ? '#f44336' : percent > 70 ? '#ff9800' : '#4caf50');
</script>

<div class="ram-bar">
  <div class="ram-label">RAM: {used.toLocaleString()} / {total.toLocaleString()} bytes ({percent}%)</div>
  <div class="ram-track">
    <div class="ram-fill" style="width: {percent}%; background: {color};"></div>
  </div>
</div>

<style>
  .ram-bar {
    padding: 6px 14px;
    font-family: 'Ubuntu', sans-serif;
    font-size: 12px;
    color: #2b2b2b;
    min-width: 200px;
    background: #ffffff;
    border: 1px solid #d9d0c7;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .ram-label {
    margin-bottom: 4px;
    font-weight: 500;
  }
  .ram-track {
    height: 8px;
    background: #eee5de;
    border-radius: 4px;
    overflow: hidden;
  }
  .ram-fill {
    height: 100%;
    background: #ff7700;
    border-radius: 4px;
    transition: width 0.2s, background 0.2s;
  }
</style>
