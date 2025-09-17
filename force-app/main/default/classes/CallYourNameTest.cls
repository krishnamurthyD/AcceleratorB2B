@isTest
private class CallYourNameTest {
  @isTest
  static void testGreetWithName() {
    String result = CallYourName.greet('Krishna');
    System.assertEquals(
      'Hello, Krishna!',
      result,
      'Expected greeting message for name "Krishna"'
    );
  }

  @isTest
  static void testGreetWithoutName() {
    String result = CallYourName.greet(null);
    System.assertEquals(
      'Hello, my friend!',
      result,
      'Expected default greeting message when name is null'
    );
  }
}
