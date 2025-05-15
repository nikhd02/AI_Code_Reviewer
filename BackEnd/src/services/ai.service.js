// Simple code review service that provides basic feedback
async function getAIReview(code, language = 'javascript') {
  // Basic code review logic
  const issues = [];
  const improvements = [];
  
  // Language-specific checks
  switch (language) {
    case 'javascript':
    case 'typescript':
      if (code.includes('console.log')) {
        issues.push('❌ Console.log statements should be removed from production code');
        improvements.push('✔ Remove console.log statements or use a proper logging library');
      }
      
      if (code.includes('var ')) {
        issues.push('❌ Using var is not recommended. Use let or const instead');
        improvements.push('✔ Replace var with let or const for better scoping');
      }
      
      if (code.includes('==')) {
        issues.push('❌ Using == for comparison is not recommended. Use === instead');
        improvements.push('✔ Replace == with === for strict equality comparison');
      }
      
      if (code.includes('function') && !code.includes('async') && code.includes('fetch')) {
        issues.push('❌ Using fetch without async/await can lead to promise handling issues');
        improvements.push('✔ Use async/await with fetch for better readability and error handling');
      }
      break;
      
    case 'python':
      if (code.includes('print(')) {
        issues.push('❌ Print statements should be removed from production code');
        improvements.push('✔ Remove print statements or use a proper logging library');
      }
      
      if (code.includes('except:')) {
        issues.push('❌ Bare except clauses are discouraged. Specify exception types');
        improvements.push('✔ Use specific exception types like except ValueError:');
      }
      
      if (code.includes('global ')) {
        issues.push('❌ Global variables should be avoided when possible');
        improvements.push('✔ Consider passing variables as parameters instead of using global');
      }
      break;
      
    case 'java':
      if (code.includes('System.out.println')) {
        issues.push('❌ System.out.println should be replaced with proper logging');
        improvements.push('✔ Use a logging framework like SLF4J or Log4j');
      }
      
      if (code.includes('public class') && !code.includes('public static void main')) {
        issues.push('❌ Main method might be missing in the public class');
        improvements.push('✔ Add public static void main(String[] args) method');
      }
      break;
      
    case 'cpp':
      if (code.includes('using namespace std;')) {
        issues.push('❌ Using namespace std is discouraged in header files');
        improvements.push('✔ Use specific namespace qualifiers or limit using to cpp files');
      }
      
      if (code.includes('cout <<')) {
        issues.push('❌ Console output should be replaced with proper logging');
        improvements.push('✔ Use a logging framework instead of cout');
      }
      break;
  }
  
  // Common checks for all languages
  if (code.includes('TODO') || code.includes('FIXME')) {
    issues.push('❌ TODO/FIXME comments found in code');
    improvements.push('✔ Address TODO/FIXME comments before committing');
  }
  
  if (code.includes('password') || code.includes('secret')) {
    issues.push('❌ Potential hardcoded credentials found');
    improvements.push('✔ Use environment variables or secure configuration for sensitive data');
  }
  
  // Generate a review based on the findings
  let review = `# Code Review (${language.toUpperCase()})\n\n`;
  
  if (issues.length > 0) {
    review += '## Issues Found\n\n';
    issues.forEach(issue => {
      review += `- ${issue}\n`;
    });
    
    review += '\n## Recommended Improvements\n\n';
    improvements.forEach(improvement => {
      review += `- ${improvement}\n`;
    });
  } else {
    review += '## No Major Issues Found\n\n';
    review += 'Your code looks good! Here are some general best practices to keep in mind:\n\n';
    review += '- Use meaningful variable and function names\n';
    review += '- Add comments for complex logic\n';
    review += '- Consider error handling for edge cases\n';
    review += '- Write unit tests for critical functionality\n';
  }
  
  review += '\n## Code Quality Tips\n\n';
  review += '1. **Readability**: Make sure your code is easy to read and understand\n';
  review += '2. **Maintainability**: Write code that is easy to maintain and extend\n';
  review += '3. **Performance**: Consider the performance implications of your code\n';
  review += '4. **Security**: Be aware of potential security vulnerabilities\n';
  review += '5. **Testing**: Write tests to ensure your code works as expected\n';
  
  return review;
}

module.exports = { getAIReview };    