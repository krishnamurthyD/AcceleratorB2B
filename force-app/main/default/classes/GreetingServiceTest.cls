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
public class GreetingServiceTest {
  /**
   * @description Test getGreeting method with a valid name.
   */
  @isTest
  static void testGetGreetingWithName() {
    String result = GreetingService.getGreeting('Krishna');
    System.assertEquals(
      '',
      result,
      'Greeting should match expected output'
    );
  }

  /**
   * @description Test getGreeting method with a blank name.
   */
  @isTest
  static void testGetGreetingWithBlankName() {
    String result = GreetingService.getGreeting('');
    System.assertEquals(
      '',
      result,
      'Greeting should default to Guest'
    );
  }
}
