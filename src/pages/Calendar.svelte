<script lang="ts">
import { demandsStore, demandsCountStore, configStore } from "../stores";

  let len = $demandsCountStore;
  let demands = $demandsStore.slice(0, len);

  console.table(demands);
  console.log($configStore);
  
</script>
