# Get Random Screenshot Mechanism

## Latest unsolved screenshots array

User has locally an array of last seen screenshots, stored in their browser.  
For example, if a user sees screenshots number 42, then 84 then 65, the array would be: [42,84,65]

The array is sorted like so: oldest to newest.
The first element of the array (index == 0) represents the oldest viewed screenshot.
The last element of the array (index == array.length-1) represents the newest viewed screenshot.

This array should only have ids of unsolved screenshots. If a screenshot is solved by the user, it shall be removed from the array.  
For example, given array [42,84,65], if user sees then solves screenshot 65, the array would then be [42,84]

If a user sees a screenshot that is already in the array, the item is moved to the end of the array.
For example, given array [42,84,65], if user sees screenshot 42, the array should be transformed to: [84,65,42]

## Get Random Screenshot Mechanism

When the client ask for a random screenshot, it sends its latest unsolved screenshots array

The backend search for an unsolved screenshot, excluding the screenshots from the latest unsolved screenshots array.

If the result is null, search again but this time excluding only the last one seen (last id of the exclude array).

If the result is still null, that means the only unsolved screenshot is the last one of the array: return that one.
