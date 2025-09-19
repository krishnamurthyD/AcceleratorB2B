/**
 * @description       : This service class provides simple greeting messages
 *                      based on the input name.
 * @author            : Krishnamurthy Donta
 * @date              : 2025-09-18
 * @group             : Utility
 * @last modified on  : 2025-09-18
 * @last modified by  : Krishnamurthy Donta
 * @modification log  :
 *   Ver   Date         Author                  Modification
 *   1.0   2025-09-18   Krishnamurthy Donta     Initial Version
 */
public with sharing class GreetingServiceOne {
  /**
   * @description Returns a greeting message with the given name.
   * @param name The name to include in the greeting.
   * @return A string greeting message.
   */
  public static String getGreeting(String name) {
    if (String.isBlank(name)) {
      return 'Hello, Guest!';
    }
    return 'Hello, ' + name + '!';
  }
}
