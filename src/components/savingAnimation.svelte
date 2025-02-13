<script>
  export let isVisible = false;
</script>

<div class="saving-overlay" class:visible={isVisible}>
  <div class="saving-content">
    <div class="spinner"></div>
    <span>Opslaan...</span>
  </div>
</div>

<style>
  .saving-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out;
  }

  .visible {
    opacity: 1;
    pointer-events: all;
  }

  .saving-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  span {
    font-size: 1.1rem;
    color: #333;
  }
</style>
