<script lang="ts">
  import {range} from "d3";
  import * as math from "../math";

  

  let arr1 = range(20).map(() => math.modelExpRandomValue(0.5));
  let arr2 = range(20).map(() => math.modelWeibullRandomValue(2.5, 1));

  console.log(arr1);
  console.log(arr2);
</script>
