# Student Mark Average Calculator
  # Grade 10 Computer Science Project

  def get_grade(average):
      """Return a letter grade based on the average mark"""
      if average >= 90:
          return "A+"
      elif average >= 80:
          return "A"
      elif average >= 70:
          return "B+"
      elif average >= 60:
          return "B"
      elif average >= 50:
          return "C"
      elif average >= 40:
          return "D"
      else:
          return "F"


  def calculate_total(marks):
      """Add up all the marks"""
      total = 0
      for mark in marks:
          total = total + mark
      return total


  def calculate_average(marks):
      """Find the average mark"""
      total = calculate_total(marks)
      average = total / len(marks)
      return average


  def get_performance_message(average):
      """Return a motivational message based on average"""
      if average >= 90:
          return "Outstanding! You are at the top of your class!"
      elif average >= 75:
          return "Great work! You are performing well above average."
      elif average >= 60:
          return "Good effort! There is room to push even higher."
      elif average >= 45:
          return "You are getting there. A bit more focus will help."
      else:
          return "Don't give up! With dedicated study you can improve."


  def analyze_subjects(subjects, marks):
      """Analyze student performance across all subjects"""
      total = calculate_total(marks)
      average = calculate_average(marks)
      grade = get_grade(average)
      message = get_performance_message(average)

      print()
      print("===== Student Marks Analyzer =====")
      print(f"{'Subject':<20} {'Mark':>8}")
      print("-" * 30)

      for i in range(len(subjects)):
          print(f"{subjects[i]:<20} {marks[i]:>5}/100")

      print("-" * 30)
      print(f"Total:    {total}/{len(marks) * 100}")
      print(f"Average:  {average:.1f}%")
      print(f"Grade:    {grade}")
      print()
      print(message)

      best_mark = max(marks)
      worst_mark = min(marks)
      best_subject = subjects[marks.index(best_mark)]
      worst_subject = subjects[marks.index(worst_mark)]

      print()
      print(f"Best subject:  {best_subject} ({best_mark}/100)")
      print(f"Needs work:    {worst_subject} ({worst_mark}/100)")

      return {
          "total": total,
          "average": average,
          "grade": grade
      }


  # ===========================
  # Main program
  # ===========================
  if __name__ == "__main__":
      num_subjects = int(input("How many subjects? "))

      subjects = []
      marks = []

      for i in range(num_subjects):
          subject = input(f"  Subject {i + 1} name: ")
          mark = int(input(f"  Mark for {subject} (0-100): "))
          subjects.append(subject)
          marks.append(mark)

      analyze_subjects(subjects, marks)
  