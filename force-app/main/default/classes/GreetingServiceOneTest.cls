/**
 * @description       : Test class for GreetingService.
 *                      Ensures correct behavior of getGreeting method.
 * @autor             : Krishnamurthy Donta
 * @date              : 2025-09-18
 * @group             : Utility
 * @last modified on  : 2025-09-18
 * @last modified by  : Krishnamurthy Donta
 * @modification log  :
 *   Ver   Date         Author                  Modification
 *   1.0   2025-09-18   Krishnamurthy Donta     Initial Version
 */
@isTest
public class GreetingServiceOneTest {
  /**
   * @description Test getGreeting method with a valid name.
   */
  @isTest
  static void testGetGreetingWithName() {
    String result = GreetingServiceOne.getGreeting('Krishna');
    System.assertEquals(
      'Hello, Krishna!',
      result,
      'Greeting should match expected output'
    );
  }

  /**
   * @description Test getGreeting method with a blank name.
   */
  @isTest
  static void testGetGreetingWithBlankName() {
    String result = GreetingServiceOne.getGreeting('');
    System.assertEquals(
      'Hello, Guest!',
      result,
      'Greeting should default to Guest'
    );
  }
}
